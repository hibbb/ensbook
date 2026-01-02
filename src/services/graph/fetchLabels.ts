// src/utils/fetchLabels.ts

import { namehash } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./client";
import { GRAPHQL_CONFIG } from "../../config/constants";
import type { ClassifiedInputs } from "../../utils/parseInputs";
// 🚀 1. 引入配置文件，避免硬编码
import { MAINNET_ADDR } from "../../config/contracts";

const ETH_PARENT_HASH =
  "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";

// 🚀 2. 从配置获取 NameWrapper 地址 (转小写以匹配 Subgraph)
const NAME_WRAPPER_ADDRESS = MAINNET_ADDR.ENS_NAME_WRAPPER.toLowerCase();

// 宽限期 90 天
const GRACE_PERIOD = 90 * 24 * 60 * 60;

interface DomainMetaResponse {
  domains: {
    id: string;
    wrappedOwner?: { id: string };
    registrant?: { id: string };
    resolver?: { addr?: { id: string } };
  }[];
}

interface OwnerDomainsResponse {
  wrappedDomains: {
    labelName: string | null;
    expiryDate?: string | null;
    owner: { id: string }; // 底层 Owner
  }[];
  legacyDomains: {
    labelName: string | null;
    expiryDate?: string | null;
  }[];
}

export async function fetchLabels(
  classified: ClassifiedInputs,
): Promise<string[]> {
  if (!classified) return [];

  const { sameOwners, linkOwners, pureLabels, ethAddresses } = classified;

  const [fetchedFromSame, fetchedFromLink, fetchedFromAddr] = await Promise.all(
    [
      fetchLabelsFromSameOwners(sameOwners),
      fetchLabelsFromLinkOwners(linkOwners),
      fetchDomainsByAddresses(new Set(ethAddresses)),
    ],
  );

  const finalLabels = new Set([
    ...pureLabels,
    ...fetchedFromSame,
    ...fetchedFromLink,
    ...fetchedFromAddr,
  ]);

  return Array.from(finalLabels);
}

/**
 * 核心复用逻辑
 */
async function fetchDomainsByAddresses(
  addresses: Set<string>,
): Promise<string[]> {
  if (addresses.size === 0) return [];

  // 1. 强制转小写
  const lowerCaseOwners = Array.from(addresses).map((addr) =>
    addr.toLowerCase(),
  );

  const labelsQuery: GraphQLQueryCode = {
    str: `query getLabelsByOwners($owners: [String!]!, $ethParent: String!) {
      # 1. 查询 Wrapped Domains
      wrappedDomains: domains(
        first: ${GRAPHQL_CONFIG.FETCH_LIMIT},
        where: {
          wrappedOwner_in: $owners,
          parent: $ethParent,
          labelName_not: null
        }
      ) {
        labelName
        expiryDate
        owner { id } # 请求底层 Owner 用于校验幽灵数据
      }

      # 2. 查询 Legacy Domains
      legacyDomains: domains(
        first: ${GRAPHQL_CONFIG.FETCH_LIMIT},
        where: {
          registrant_in: $owners,
          parent: $ethParent,
          labelName_not: null
        }
      ) {
        labelName
        expiryDate
      }
    }`,
    vars: {
      owners: lowerCaseOwners,
      ethParent: ETH_PARENT_HASH,
    },
  };

  const labelsData = (await queryData(labelsQuery)) as OwnerDomainsResponse;
  const now = Math.floor(Date.now() / 1000);

  // 🚀 3. 针对不同类型域名的过期检查函数

  // A. Legacy 域名：expiryDate 是“注册到期日”，需要加上宽限期才是“释放时间”
  const isLegacyNotExpired = (expiryDate?: string | null) => {
    if (!expiryDate) return true;
    const exp = parseInt(expiryDate);
    // 逻辑：注册到期 + 90天 >= 现在
    return exp + GRACE_PERIOD >= now;
  };

  // B. Wrapped 域名：expiryDate 已经是“释放时间” (NameWrapper 逻辑)
  const isWrappedNotExpired = (expiryDate?: string | null) => {
    if (!expiryDate) return true;
    const exp = parseInt(expiryDate);
    // 逻辑：释放时间 >= 现在 (不要再加 90 天！)
    return exp >= now;
  };

  // 4. 处理 Wrapped Domains
  const validWrapped = labelsData.wrappedDomains
    .filter((d) => {
      if (typeof d.labelName !== "string") return false;

      // [核心修复 1]：幽灵所有权过滤
      // 必须确保底层 Registry 的 Owner 确实是 NameWrapper 合约
      // 否则说明该域名已被其他人通过 Legacy 方式重新注册
      if (d.owner.id.toLowerCase() !== NAME_WRAPPER_ADDRESS) {
        return false;
      }

      // [核心修复 2]：使用 Wrapped 专用的过期逻辑
      return isWrappedNotExpired(d.expiryDate);
    })
    .map((d) => d.labelName as string);

  // 5. 处理 Legacy Domains
  const validLegacy = labelsData.legacyDomains
    .filter((d) => {
      if (typeof d.labelName !== "string") return false;
      // 使用 Legacy 专用的过期逻辑
      return isLegacyNotExpired(d.expiryDate);
    })
    .map((d) => d.labelName as string);

  return [...validWrapped, ...validLegacy];
}

// ... (其余辅助函数保持不变)
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
