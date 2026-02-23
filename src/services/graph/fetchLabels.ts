// src/services/graph/fetchLabels.ts

import { namehash } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./client";
import {
  ETH_PARENT_HASH,
  GRACE_PERIOD_DURATION,
  GRAPHQL_CONFIG,
} from "../../config/constants";
import type { ClassifiedInputs } from "../../utils/parseInputs";
import { MAINNET_CONTRACTS } from "../../config/contracts";

const NAME_WRAPPER_ADDRESS = MAINNET_CONTRACTS.ENS_NAME_WRAPPER.toLowerCase();

interface DomainMetaResponse {
  domains: {
    id: string;
    wrappedOwner?: { id: string };
    registrant?: { id: string };
    resolver?: { addr?: { id: string } };
  }[];
}

// 1. 更新接口定义：增加 registration 字段
interface OwnerDomainsResponse {
  wrappedDomains: {
    labelName: string | null;
    expiryDate?: string | null;
    owner: { id: string };
  }[];
  legacyDomains: {
    labelName: string | null;
    expiryDate?: string | null;
    // 新增嵌套对象
    registration?: {
      expiryDate: string;
    } | null;
  }[];
}

export async function fetchLabels(
  classified: ClassifiedInputs,
): Promise<string[]> {
  if (!classified) return [];

  const { sameOwners, pureLabels, ethAddresses } = classified;

  const [fetchedFromSame, fetchedFromAddr] = await Promise.all([
    fetchLabelsFromSameOwners(sameOwners),
    fetchDomainsByAddresses(new Set(ethAddresses)),
  ]);

  const finalLabels = new Set([
    ...pureLabels,
    ...fetchedFromSame,
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

  const lowerCaseOwners = Array.from(addresses).map((addr) =>
    addr.toLowerCase(),
  );

  // 2. 更新 GraphQL 查询：请求 registration.expiryDate
  const labelsQuery: GraphQLQueryCode = {
    str: `query getLabelsByOwners($owners: [String!]!, $ethParent: String!) {
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
        owner { id }
      }

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
        registration {
          expiryDate
        }
      }
    }`,
    vars: {
      owners: lowerCaseOwners,
      ethParent: ETH_PARENT_HASH,
    },
  };

  const labelsData = (await queryData(labelsQuery)) as OwnerDomainsResponse;
  const now = Math.floor(Date.now() / 1000);

  // Wrapped 域名的判断逻辑保持不变 (NameWrapper 的 expiryDate 通常比较可靠)
  const isWrappedNotExpired = (expiryDate?: string | null) => {
    if (!expiryDate) return true;
    const exp = parseInt(expiryDate);
    return exp >= now;
  };

  const validWrapped = labelsData.wrappedDomains
    .filter((d) => {
      if (typeof d.labelName !== "string") return false;
      if (d.owner.id.toLowerCase() !== NAME_WRAPPER_ADDRESS) {
        return false;
      }
      return isWrappedNotExpired(d.expiryDate);
    })
    .map((d) => d.labelName as string);

  // 3. 核心修复：Legacy 域名的过滤逻辑
  const validLegacy = labelsData.legacyDomains
    .filter((d) => {
      if (typeof d.labelName !== "string") return false;

      // A. 优先使用权威的 registration.expiryDate
      if (d.registration?.expiryDate) {
        const exp = parseInt(d.registration.expiryDate);
        return exp + GRACE_PERIOD_DURATION >= now;
      }

      // B. 如果没有 registration (极少见情况)，回退到 domain.expiryDate
      if (d.expiryDate) {
        const exp = parseInt(d.expiryDate);
        return exp + GRACE_PERIOD_DURATION >= now;
      }

      // C. 如果两个都没有，说明数据缺失或已释放，视为无效
      // 之前这里返回 true，导致了 Released 域名泄露
      return false;
    })
    .map((d) => d.labelName as string);

  return [...validWrapped, ...validLegacy];
}

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
