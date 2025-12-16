// src/utils/fetchLabels.ts

import { namehash } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./globals";
import type { ClassifiedLabels } from "./parseLabels";

// ============================================================================
// 1. 常量定义
// ============================================================================

// .eth 的 Namehash (固定值)
// 用于过滤父级，确保只获取二级域名 (如 alice.eth)，排除三级域名
const ETH_PARENT_HASH =
  "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";

// ============================================================================
// 2. 类型定义
// ============================================================================

// Step 1: 元数据查询返回 (通用)
interface DomainMetaResponse {
  domains: {
    id: string;
    wrappedOwner?: { id: string };
    registrant?: { id: string };
    resolver?: { addr?: { id: string } };
  }[];
}

// Step 2: 标签反查返回 (通用)
interface OwnerDomainsResponse {
  wrappedDomains: { labelName: string | null }[];
  legacyDomains: { labelName: string | null }[];
}

// ============================================================================
// 3. 主函数
// ============================================================================

export async function fetchLabels(
  classified: ClassifiedLabels,
): Promise<string[]> {
  // 🛡️ 防御性编程
  if (!classified) return [];

  const { sameOwners, linkOwners, pureLabels } = classified;

  const [fetchedFromSame, fetchedFromLink] = await Promise.all([
    fetchLabelsFromSameOwners(sameOwners),
    fetchLabelsFromLinkOwners(linkOwners),
  ]);

  const finalLabels = new Set([
    ...pureLabels,
    ...fetchedFromSame,
    ...fetchedFromLink,
  ]);

  return Array.from(finalLabels);
}

// ============================================================================
// 4. 具体实现函数
// ============================================================================

/**
 * 核心复用逻辑：根据一组地址，查询它们拥有的 .eth 二级域名
 * * ⚡️ 优化：增加 parent: $ethParent 过滤，只返回 .eth 直接子域名
 */
async function fetchDomainsByAddresses(
  addresses: Set<string>,
): Promise<string[]> {
  if (addresses.size === 0) return [];

  const labelsQuery: GraphQLQueryCode = {
    str: `query getLabelsByOwners($owners: [String!]!, $ethParent: String!) {
      # 1. 查询 Wrapped Domains (且父级是 .eth)
      wrappedDomains: domains(
        first: 1000,
        where: {
          wrappedOwner_in: $owners,
          parent: $ethParent,     # <--- 核心修改：限定父节点
          labelName_not: null
        }
      ) {
        labelName
      }

      # 2. 查询 Legacy Domains (且父级是 .eth)
      legacyDomains: domains(
        first: 1000,
        where: {
          registrant_in: $owners,
          parent: $ethParent,     # <--- 核心修改：限定父节点
          labelName_not: null
        }
      ) {
        labelName
      }
    }`,
    vars: {
      owners: Array.from(addresses),
      ethParent: ETH_PARENT_HASH, // 传入 .eth 的 hash
    },
  };

  const labelsData = (await queryData(labelsQuery)) as OwnerDomainsResponse;

  const extractLabels = (list: { labelName: string | null }[]) =>
    list
      .map((d) => d.labelName)
      .filter((l): l is string => typeof l === "string" && l.length > 0);

  return [
    ...extractLabels(labelsData.wrappedDomains),
    ...extractLabels(labelsData.legacyDomains),
  ];
}

/**
 * SameOwners 流程
 */
async function fetchLabelsFromSameOwners(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];

  const domainIDs = names.map((name) => namehash(name));

  // Step 1: 获取 Owner 地址
  const metaQuery: GraphQLQueryCode = {
    str: `query getOwners($ids: [ID!]!) {
      domains(where: { id_in: $ids }) {
        wrappedOwner { id }
        registrant { id }
      }
    }`,
    vars: { ids: domainIDs },
  };

  const metaData = (await queryData(metaQuery)) as DomainMetaResponse;
  const ownerAddresses = new Set<string>();

  metaData.domains.forEach((d) => {
    const ownerId = d.wrappedOwner?.id || d.registrant?.id;
    if (ownerId) ownerAddresses.add(ownerId);
  });

  // Step 2: 复用通用查询 (自动过滤非 .eth 域名)
  return fetchDomainsByAddresses(ownerAddresses);
}

/**
 * LinkOwners 流程
 */
async function fetchLabelsFromLinkOwners(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];

  const domainIDs = names.map((name) => namehash(name));

  // Step 1: 获取解析目标地址
  const metaQuery: GraphQLQueryCode = {
    str: `query getResolvers($ids: [ID!]!) {
      domains(where: { id_in: $ids }) {
        resolver { addr { id } }
      }
    }`,
    vars: { ids: domainIDs },
  };

  const metaData = (await queryData(metaQuery)) as DomainMetaResponse;
  const targetAddresses = new Set<string>();

  metaData.domains.forEach((d) => {
    const addr = d.resolver?.addr?.id;
    if (addr) targetAddresses.add(addr);
  });

  // Step 2: 复用通用查询 (自动过滤非 .eth 域名)
  return fetchDomainsByAddresses(targetAddresses);
}
