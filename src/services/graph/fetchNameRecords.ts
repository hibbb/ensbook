// src/utils/fetchNameRecords.ts

import { labelhash, namehash } from "viem";
import { normalize } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./client";
import type { NameRecord } from "../../types/ensNames";
import { getContracts } from "../../config/contracts";
import { GRAPHQL_CONFIG } from "../../config/constants"; // 🚀 引入全局常量

// ============================================================================
// 1. 内部逻辑常量与辅助函数
// ============================================================================

const DURATION_GRACE_PERIOD = 90 * 24 * 60 * 60;
const DURATION_PREMIUM_PERIOD = 21 * 24 * 60 * 60;
const contracts = getContracts(1);
const WRAPPER_ADDRESS = contracts.ENS_NAME_WRAPPER.toLowerCase();

// 🚀 使用全局配置确定分段长度
const CHUNK_SIZE = GRAPHQL_CONFIG.FETCH_LIMIT;

/**
 * 🚀 数组分段工具函数
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

// 🚀 明确定义 Account 类型，消除 any 隐患
interface SubgraphAccount {
  id: string;
  primaryName: { name: string } | null;
}

interface PrimaryNameResponse {
  accounts: SubgraphAccount[];
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
// 3. 批量获取 Primary Names (支持分段查询)
// ============================================================================

async function fetchPrimaryNames(
  addresses: string[],
): Promise<Map<string, string>> {
  const cleanAddresses = Array.from(
    new Set(addresses.filter((a) => a).map((a) => a.toLowerCase())),
  );
  if (cleanAddresses.length === 0) return new Map();

  // 🚀 分段获取地址的主域名，使用配置定义的 CHUNK_SIZE
  const chunks = chunkArray(cleanAddresses, CHUNK_SIZE);
  const nameMap = new Map<string, string>();

  const tasks = chunks.map(async (chunk) => {
    const query: GraphQLQueryCode = {
      str: `query getPrimaryNames($addresses: [ID!]!) {
        accounts(where: { id_in: $addresses }) {
          id
          primaryName { name }
        }
      }`,
      vars: { addresses: chunk },
    };

    // 🚀 修复：显式指定返回类型，消除 any
    const res = (await queryData(query)) as PrimaryNameResponse;
    res.accounts.forEach((acc) => {
      if (acc.primaryName?.name) nameMap.set(acc.id, acc.primaryName.name);
    });
  });

  await Promise.all(tasks);
  return nameMap;
}

// ============================================================================
// 4. 主函数：并发分段获取记录
// ============================================================================

export async function fetchNameRecords(
  labels: string[],
): Promise<NameRecord[]> {
  if (!labels || labels.length === 0) return [];

  // 1. 数据规范化清洗
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

  // 2. 将标签切分为配置定义的区块大小进行并发请求
  const labelChunks = chunkArray(validLabels, CHUNK_SIZE);
  const allRegistrations: SubgraphRegistration[] = [];
  const allWrappedDomains: SubgraphWrappedDomain[] = [];

  // 3. 并发执行请求任务
  const fetchTasks = labelChunks.map(async (chunk) => {
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

    const response = (await queryData(query)) as FetchResponse;
    allRegistrations.push(...response.registrations);
    allWrappedDomains.push(...response.wrappedDomains);
  });

  try {
    await Promise.all(fetchTasks);

    const regMap = new Map(allRegistrations.map((r) => [r.labelName, r]));
    const wrapMap = new Map(allWrappedDomains.map((w) => [w.name, w]));
    const ownerAddressesSet = new Set<string>();

    const baseRecords = validLabels.map((label) => {
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
        };
      }

      const expiryTime = parseInt(registration.expiryDate);
      const registrantId = registration.registrant.id.toLowerCase();
      const isWrapped = registrantId === WRAPPER_ADDRESS;

      const currentOwner = (
        isWrapped ? wrappedDomain?.owner.id || registrantId : registrantId
      ).toLowerCase();

      ownerAddressesSet.add(currentOwner);

      return {
        ...baseInfo,
        level: 1,
        status: deriveNameStatus(expiryTime),
        wrapped: isWrapped,
        registeredTime: parseInt(registration.registrationDate),
        expiryTime,
        releaseTime: expiryTime + DURATION_GRACE_PERIOD,
        owner: currentOwner,
      };
    });

    const primaryNameMap = await fetchPrimaryNames(
      Array.from(ownerAddressesSet),
    );

    return baseRecords.map((record) => ({
      ...record,
      ownerPrimaryName: record.owner
        ? primaryNameMap.get(record.owner)
        : undefined,
    })) as NameRecord[];
  } catch (error) {
    console.error("并发获取域名记录失败:", error);
    return [];
  }
}
