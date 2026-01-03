// src/utils/fetchNameRecords.ts

import { labelhash, namehash } from "viem";
import { normalize } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./client";
import type { NameRecord } from "../../types/ensNames";
import { getContracts } from "../../config/contracts";
import { GRAPHQL_CONFIG } from "../../config/constants";

// ... (常量定义保持不变)
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

// 类型定义
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

// 🚀 新增：携带状态的查询结果
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

export async function fetchNameRecords(
  labels: string[],
): Promise<NameRecord[]> {
  if (!labels || labels.length === 0) return [];

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

  // 🚀 1. 执行查询并捕获状态
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
      // 失败时显式标记 success: false
      return {
        success: false,
        data: { registrations: [], wrappedDomains: [] },
      };
    }
  });

  try {
    const results = await Promise.all(fetchTasks);

    // 🚀 2. 构建 "label -> success" 映射表
    // 用于判断某个 label 所在的批次是否成功
    const labelSuccessMap = new Map<string, boolean>();
    results.forEach((result, index) => {
      const chunkLabels = labelChunks[index];
      chunkLabels.forEach((label) => {
        labelSuccessMap.set(label, result.success);
      });
    });

    // 扁平化数据
    const allRegistrations = results.flatMap((r) => r.data.registrations);
    const allWrappedDomains = results.flatMap((r) => r.data.wrappedDomains);

    const regMap = new Map(allRegistrations.map((r) => [r.labelName, r]));
    const wrapMap = new Map(allWrappedDomains.map((w) => [w.name, w]));

    const records = validLabels.map((label) => {
      // 获取该 label 所在批次的查询状态
      const isFetchSuccess = labelSuccessMap.get(label) ?? false;

      const baseInfo = {
        label,
        labelhash: labelhash(label),
        namehash: namehash(`${label}.eth`),
        length: label.length,
      };

      // 🚀 3. 如果查询失败，直接返回 Unknown 状态
      if (!isFetchSuccess) {
        return {
          ...baseInfo,
          level: 1,
          status: "Unknown", // <--- 关键修改
          wrapped: false,
          registeredTime: 0,
          expiryTime: 0,
          releaseTime: 0,
          owner: null,
          ownerPrimaryName: undefined,
        };
      }

      const registration = regMap.get(label);
      const wrappedDomain = wrapMap.get(`${label}.eth`);

      // 🚀 4. 查询成功但无记录 -> 确实是 Available
      if (!registration) {
        return {
          ...baseInfo,
          level: 1,
          status: "Available",
          wrapped: false,
          registeredTime: 0,
          expiryTime: 0,
          releaseTime: 0,
          owner: null,
          ownerPrimaryName: undefined,
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
        level: 1,
        status: deriveNameStatus(expiryTime),
        wrapped: isWrapped,
        registeredTime: parseInt(registration.registrationDate),
        expiryTime,
        releaseTime: expiryTime + DURATION_GRACE_PERIOD,
        owner: currentOwner,
        ownerPrimaryName: undefined,
      };
    });

    return records as NameRecord[];
  } catch (error) {
    console.error("Critical error in fetchNameRecords:", error);
    // 如果发生严重错误，所有记录标记为 Unknown
    return validLabels.map((label) => ({
      label,
      labelhash: labelhash(label),
      namehash: namehash(`${label}.eth`),
      length: label.length,
      level: 1,
      status: "Unknown",
      wrapped: false,
      registeredTime: 0,
      expiryTime: 0,
      releaseTime: 0,
      owner: null,
    })) as NameRecord[];
  }
}
