// src/services/graph/fetchLabels.ts

import { namehash } from "viem/ens";
import { queryData, type GraphQLQueryCode } from "./client";
import {
  ETH_PARENT_HASH,
  GRACE_PERIOD_DURATION,
  GRAPHQL_CONFIG,
} from "../../config/constants";
import type { ClassifiedInputs } from "../../utils/parseInputs";
import { MAINNET_ADDR } from "../../config/contracts";

const NAME_WRAPPER_ADDRESS = MAINNET_ADDR.ENS_NAME_WRAPPER.toLowerCase();

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
    owner: { id: string };
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

  // 🗑️ 移除 linkOwners
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
      }
    }`,
    vars: {
      owners: lowerCaseOwners,
      ethParent: ETH_PARENT_HASH,
    },
  };

  const labelsData = (await queryData(labelsQuery)) as OwnerDomainsResponse;
  const now = Math.floor(Date.now() / 1000);

  const isLegacyNotExpired = (expiryDate?: string | null) => {
    if (!expiryDate) return true;
    const exp = parseInt(expiryDate);
    return exp + GRACE_PERIOD_DURATION >= now;
  };

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

  const validLegacy = labelsData.legacyDomains
    .filter((d) => {
      if (typeof d.labelName !== "string") return false;
      return isLegacyNotExpired(d.expiryDate);
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
