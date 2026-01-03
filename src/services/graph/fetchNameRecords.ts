// src/services/graph/fetchNameRecords.ts

import { labelhash, namehash } from "viem";
import { normalize } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./client";
import type { NameRecord } from "../../types/ensNames";
import { getContracts } from "../../config/contracts";
import { GRAPHQL_CONFIG } from "../../config/constants";
// 🚀 核心修改：引入统一的备注存储服务
import { getStoredMemos } from "../../services/storage/memos";

// ============================================================================
// 1. 内部逻辑常量与辅助函数
// ============================================================================

const DURATION_GRACE_PERIOD = 90 * 24 * 60 * 60;
const DURATION_PREMIUM_PERIOD = 21 * 24 * 60 * 60;
const contracts = getContracts(1);
const WRAPPER_ADDRESS = contracts.ENS_NAME_WRAPPER.toLowerCase();

const CHUNK_SIZE = GRAPHQL_CONFIG.FETCH_LIMIT;

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ============================================================================
// 2. 类型定义
// ============================================================================

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
  const graceEnd = expiryTimestamp + DURATION_GRACE_PERIOD;
  const premiumEnd = graceEnd + DURATION_PREMIUM_PERIOD;

  if (currentTimestamp <= expiryTimestamp) return "Active";
  if (currentTimestamp <= graceEnd) return "Grace";
  if (currentTimestamp <= premiumEnd) return "Premium";
  return "Released";
}

// ============================================================================
// 3. 主函数
// ============================================================================

export async function fetchNameRecords(
  labels: string[],
): Promise<NameRecord[]> {
  if (!labels || labels.length === 0) return [];

  // 🚀 1. 在开始处理前，一次性获取所有备注
  // 这比在 map 循环中每次都读 localStorage 性能更好
  const allMemos = getStoredMemos();

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

      // 🚀 2. 从统一的数据源中查找备注
      const memo = allMemos[label];

      const baseInfo = {
        label,
        labelhash: labelhash(label),
        namehash: namehash(`${label}.eth`),
        length: label.length,
      };

      if (!isFetchSuccess) {
        return {
          ...baseInfo,
          level: 0,
          status: "Unknown",
          wrapped: false,
          registeredTime: 0,
          expiryTime: 0,
          releaseTime: 0,
          owner: null,
          ownerPrimaryName: undefined,
          memo: memo, // 即使失败也返回备注
        };
      }

      const registration = regMap.get(label);
      const wrappedDomain = wrapMap.get(`${label}.eth`);

      if (!registration) {
        return {
          ...baseInfo,
          level: 0,
          status: "Available",
          wrapped: false,
          registeredTime: 0,
          expiryTime: 0,
          releaseTime: 0,
          owner: null,
          ownerPrimaryName: undefined,
          memo: memo, // 即使未注册也返回备注
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
        level: 0,
        status: deriveNameStatus(expiryTime),
        wrapped: isWrapped,
        registeredTime: parseInt(registration.registrationDate),
        expiryTime,
        releaseTime: expiryTime + DURATION_GRACE_PERIOD,
        owner: currentOwner,
        ownerPrimaryName: undefined,
        memo: memo, // 🚀 填充备注字段
      };
    });

    return records as NameRecord[];
  } catch (error) {
    console.error("Critical error in fetchNameRecords:", error);
    // 即使严重错误，也尝试返回带有备注的 Unknown 记录
    const allMemos = getStoredMemos();
    return validLabels.map((label) => ({
      label,
      labelhash: labelhash(label),
      namehash: namehash(`${label}.eth`),
      length: label.length,
      level: 0,
      status: "Unknown",
      wrapped: false,
      registeredTime: 0,
      expiryTime: 0,
      releaseTime: 0,
      owner: null,
      memo: allMemos[label],
    })) as NameRecord[];
  }
}
