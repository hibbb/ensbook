// src/utils/fetchNameRecords.ts

import { labelhash, namehash } from "viem";
import { normalize } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./client";
import type { NameRecord } from "../../types/ensNames";
import { getContracts } from "../../config/contracts";
import { GRAPHQL_CONFIG } from "../../config/constants";

// ============================================================================
// 1. 内部逻辑常量与辅助函数
// ============================================================================

const DURATION_GRACE_PERIOD = 90 * 24 * 60 * 60;
const DURATION_PREMIUM_PERIOD = 21 * 24 * 60 * 60;
const contracts = getContracts(1);
const WRAPPER_ADDRESS = contracts.ENS_NAME_WRAPPER.toLowerCase();

const CHUNK_SIZE = GRAPHQL_CONFIG.FETCH_LIMIT;

/**
 * 数组分段工具函数
 */
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

interface FetchResponse {
  registrations: SubgraphRegistration[];
  wrappedDomains: SubgraphWrappedDomain[];
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
// 3. 主函数：只负责 Subgraph 基础数据查询 (优化后的版本)
// ============================================================================

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

  // 🚀 优化建议应用：fetchTasks 返回各分段的响应数据，而不是直接 push 到外部变量
  const fetchTasks = labelChunks.map(async (chunk): Promise<FetchResponse> => {
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
      return (await queryData(query)) as FetchResponse;
    } catch (err) {
      console.warn("Subgraph chunk fetch error:", err);
      return { registrations: [], wrappedDomains: [] }; // 失败返回空数据以防 Promise.all 崩溃
    }
  });

  try {
    // 🚀 优化建议应用：使用 Promise.all 获取所有结果，然后统一展平 (Flat)
    const responses = await Promise.all(fetchTasks);
    const allRegistrations = responses.flatMap((r) => r.registrations);
    const allWrappedDomains = responses.flatMap((r) => r.wrappedDomains);

    const regMap = new Map(allRegistrations.map((r) => [r.labelName, r]));
    const wrapMap = new Map(allWrappedDomains.map((w) => [w.name, w]));

    const records = validLabels.map((label) => {
      const registration = regMap.get(label);
      const wrappedDomain = wrapMap.get(`${label}.eth`);

      const baseInfo = {
        label,
        labelhash: labelhash(label),
        namehash: namehash(`${label}.eth`),
        length: label.length,
      };

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
    console.error("获取域名记录失败:", error);
    return [];
  }
}
