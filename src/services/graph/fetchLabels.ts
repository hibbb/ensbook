// src/utils/fetchLabels.ts

import { namehash } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./client";
import { GRAPHQL_CONFIG } from "../../config/constants";
import type { ClassifiedInputs } from "../../utils/parseInputs";

// ... (常量定义保持不变)
const ETH_PARENT_HASH =
  "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";

// ... (类型定义保持不变)
interface DomainMetaResponse {
  domains: {
    id: string;
    wrappedOwner?: { id: string };
    registrant?: { id: string };
    resolver?: { addr?: { id: string } };
  }[];
}

interface OwnerDomainsResponse {
  wrappedDomains: { labelName: string | null }[];
  legacyDomains: { labelName: string | null }[];
}

// ============================================================================
// 3. 主函数
// ============================================================================

export async function fetchLabels(
  classified: ClassifiedInputs,
): Promise<string[]> {
  // 🛡️ 防御性编程
  if (!classified) return [];

  const { sameOwners, linkOwners, pureLabels, ethAddresses } = classified; // 🚀 解构 ethAddresses

  // 并行执行所有查询任务
  const [fetchedFromSame, fetchedFromLink, fetchedFromAddr] = await Promise.all(
    [
      fetchLabelsFromSameOwners(sameOwners),
      fetchLabelsFromLinkOwners(linkOwners),
      // 🚀 新增：直接查询以太坊地址持有的域名
      // 复用现有的 fetchDomainsByAddresses 函数
      fetchDomainsByAddresses(new Set(ethAddresses)),
    ],
  );

  const finalLabels = new Set([
    ...pureLabels,
    ...fetchedFromSame,
    ...fetchedFromLink,
    ...fetchedFromAddr, // 🚀 合并地址查询结果
  ]);

  return Array.from(finalLabels);
}

// ============================================================================
// 4. 具体实现函数
// ============================================================================

/**
 * 核心复用逻辑：根据一组地址，查询它们拥有的 .eth 二级域名
 */
async function fetchDomainsByAddresses(
  addresses: Set<string>,
): Promise<string[]> {
  if (addresses.size === 0) return [];

  const labelsQuery: GraphQLQueryCode = {
    str: `query getLabelsByOwners($owners: [String!]!, $ethParent: String!) {
      # 1. 查询 Wrapped Domains (且父级是 .eth)
      wrappedDomains: domains(
        first: ${GRAPHQL_CONFIG.FETCH_LIMIT},
        where: {
          wrappedOwner_in: $owners,
          parent: $ethParent,
          labelName_not: null
        }
      ) {
        labelName
      }

      # 2. 查询 Legacy Domains (且父级是 .eth)
      legacyDomains: domains(
        first: ${GRAPHQL_CONFIG.FETCH_LIMIT},
        where: {
          registrant_in: $owners,
          parent: $ethParent,
          labelName_not: null
        }
      ) {
        labelName
      }
    }`,
    vars: {
      owners: Array.from(addresses),
      ethParent: ETH_PARENT_HASH,
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

// ... (fetchLabelsFromSameOwners 和 fetchLabelsFromLinkOwners 保持不变)
async function fetchLabelsFromSameOwners(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];
  const domainIDs = names.map((name) => namehash(name));
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
  return fetchDomainsByAddresses(ownerAddresses);
}

async function fetchLabelsFromLinkOwners(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];
  const domainIDs = names.map((name) => namehash(name));
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
  return fetchDomainsByAddresses(targetAddresses);
}
