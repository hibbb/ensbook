// src/services/graph/fetchNameRecords.ts

import { labelhash, namehash } from "viem";
import { normalize } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./client";
import type { NameRecord } from "../../types/ensNames";
import { MAINNET_CONTRACTS } from "../../config/contracts";
import {
  GRAPHQL_CONFIG,
  GRACE_PERIOD_DURATION,
  PREMIUM_PERIOD_DURATION,
} from "../../config/constants";
import { getFullUserData } from "../../services/storage/userStore";

// ... (常量定义保持不变) ...
const WRAPPER_ADDRESS = MAINNET_CONTRACTS.ENS_NAME_WRAPPER.toLowerCase();
const CHUNK_SIZE = GRAPHQL_CONFIG.FETCH_LIMIT;

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ... (类型定义和 deriveNameStatus 保持不变) ...
interface SubgraphRegistration {
  id: string;
  labelName: string;
  expiryDate: string;
  registrationDate: string;
  registrant: { id: string };
}
interface SubgraphWrappedDomain {
  name: string;
  owner: { id: string };
}
interface FetchResult {
  success: boolean;
  data: {
    registrations: SubgraphRegistration[];
    wrappedDomains: SubgraphWrappedDomain[];
  };
}
function deriveNameStatus(expiryTimestamp: number): NameRecord["status"] {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const graceEnd = expiryTimestamp + GRACE_PERIOD_DURATION;
  const premiumEnd = graceEnd + PREMIUM_PERIOD_DURATION;
  if (currentTimestamp <= expiryTimestamp) return "Active";
  if (currentTimestamp <= graceEnd) return "Grace";
  if (currentTimestamp <= premiumEnd) return "Premium";
  return "Released";
}

export async function fetchNameRecords(
  labels: string[],
): Promise<NameRecord[]> {
  if (!labels || labels.length === 0) return [];

  const userData = getFullUserData();
  const metadata = userData.metadata;

  const validLabels = Array.from(
    new Set(
      labels
        .filter((l) => l && l.trim().length > 0)
        .map((l) => {
          try {
            return normalize(l.trim());
          } catch {
            return null;
          }
        })
        .filter((l): l is string => l !== null),
    ),
  );

  if (validLabels.length === 0) return [];

  const labelChunks = chunkArray(validLabels, CHUNK_SIZE);

  const fetchTasks = labelChunks.map(async (chunk): Promise<FetchResult> => {
    const targetNames = chunk.map((label) => `${label}.eth`);
    const query: GraphQLQueryCode = {
      str: `query getNameRecords($labels: [String!]!, $names: [String!]!) {
        registrations(first: ${CHUNK_SIZE}, where: { labelName_in: $labels }) {
          id
          labelName
          expiryDate
          registrationDate
          registrant { id }
        }
        wrappedDomains(first: ${CHUNK_SIZE}, where: { name_in: $names }) {
          name
          owner { id }
        }
      }`,
      vars: { labels: chunk, names: targetNames },
    };

    try {
      const data = (await queryData(query)) as {
        registrations: SubgraphRegistration[];
        wrappedDomains: SubgraphWrappedDomain[];
      };
      return { success: true, data };
    } catch (err) {
      console.warn("Subgraph chunk fetch error:", err);
      return {
        success: false,
        data: { registrations: [], wrappedDomains: [] },
      };
    }
  });

  try {
    const results = await Promise.all(fetchTasks);

    const labelSuccessMap = new Map<string, boolean>();
    results.forEach((result, index) => {
      const chunkLabels = labelChunks[index];
      chunkLabels.forEach((label) => {
        labelSuccessMap.set(label, result.success);
      });
    });

    const allRegistrations = results.flatMap((r) => r.data.registrations);
    const allWrappedDomains = results.flatMap((r) => r.data.wrappedDomains);

    const regMap = new Map(allRegistrations.map((r) => [r.labelName, r]));
    const wrapMap = new Map(allWrappedDomains.map((w) => [w.name, w]));

    const records = validLabels.map((label) => {
      const isFetchSuccess = labelSuccessMap.get(label) ?? false;

      const meta = metadata[label];
      const memo = meta?.memo || "";
      const level = meta?.level || 0;

      const baseInfo = {
        label,
        labelhash: labelhash(label),
        namehash: namehash(`${label}.eth`),
        length: label.length,
      };

      if (!isFetchSuccess) {
        return {
          ...baseInfo,
          level,
          status: "Unknown",
          wrapped: false,
          registeredTime: 0,
          expiryTime: 0,
          releaseTime: 0,
          owner: null,
          ownerPrimaryName: undefined,
          memo,
        };
      }

      const registration = regMap.get(label);
      const wrappedDomain = wrapMap.get(`${label}.eth`);

      if (!registration) {
        return {
          ...baseInfo,
          level,
          status: "Available",
          wrapped: false,
          registeredTime: 0,
          expiryTime: 0,
          releaseTime: 0,
          owner: null,
          ownerPrimaryName: undefined,
          memo,
        };
      }

      const expiryTime = parseInt(registration.expiryDate);
      const registrantId = registration.registrant.id.toLowerCase();
      const isWrapped = registrantId === WRAPPER_ADDRESS;

      const currentOwner = (
        isWrapped ? wrappedDomain?.owner.id || registrantId : registrantId
      ).toLowerCase();

      return {
        ...baseInfo,
        level,
        status: deriveNameStatus(expiryTime),
        wrapped: isWrapped,
        registeredTime: parseInt(registration.registrationDate),
        expiryTime,
        releaseTime: expiryTime + GRACE_PERIOD_DURATION,
        owner: currentOwner,
        ownerPrimaryName: undefined,
        memo,
      };
    });

    return records as NameRecord[];
  } catch (error) {
    console.error("Critical error in fetchNameRecords:", error);
    // 错误处理：从 metadata 读取
    const userData = getFullUserData();
    const metadata = userData.metadata;

    return validLabels.map((label) => {
      const meta = metadata[label];
      return {
        label,
        labelhash: labelhash(label),
        namehash: namehash(`${label}.eth`),
        length: label.length,
        level: meta?.level || 0,
        status: "Unknown",
        wrapped: false,
        registeredTime: 0,
        expiryTime: 0,
        releaseTime: 0,
        owner: null,
        memo: meta?.memo || "",
      };
    }) as NameRecord[];
  }
}
