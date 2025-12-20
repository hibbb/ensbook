// src/utils/fetchNameRecords.ts

import { labelhash, namehash } from "viem";
import { normalize } from "viem/ens"; // ⚡️ 最终安全关口逻辑
import { queryData, type GraphQLQueryCode } from "./client";
import type { NameRecord } from "../../types/ensNames";
import { getContracts } from "../../config/contracts";
import { GRAPHQL_CONFIG } from "../../config/constants";

// ============================================================================
// 1. 内部逻辑常量
// ============================================================================

const DURATION_GRACE_PERIOD = 90 * 24 * 60 * 60;
const DURATION_PREMIUM_PERIOD = 21 * 24 * 60 * 60;

const contracts = getContracts(1);
const WRAPPER_ADDRESS = contracts.ENS_NAME_WRAPPER.toLowerCase();

// ============================================================================
// 2. 类型定义与状态推导
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
  const gracePeriodEnd = expiryTimestamp + DURATION_GRACE_PERIOD;
  const premiumPeriodEnd = gracePeriodEnd + DURATION_PREMIUM_PERIOD;

  if (currentTimestamp <= expiryTimestamp) return "Active";
  if (currentTimestamp <= gracePeriodEnd) return "GracePeriod";
  if (currentTimestamp <= premiumPeriodEnd) return "PremiumPeriod";
  return "Released";
}

// ============================================================================
// 3. 主函数逻辑
// ============================================================================

export async function fetchNameRecords(
  labels: string[],
): Promise<NameRecord[]> {
  if (!labels || labels.length === 0) return [];

  // ⚡️ 精简后的清洗逻辑
  // 1. 过滤空值与空白字符
  // 2. 使用 normalize 代替 toLowerCase (因为 normalize 包含更标准的 Case Folding)
  // 3. 过滤掉无法通过规范化的非法标签
  // 4. 利用 Set 去重
  const validLabels = Array.from(
    new Set(
      labels
        .filter((l) => l && l.trim().length > 0)
        .map((l) => {
          try {
            return normalize(l.trim());
          } catch {
            return null; // 排除非法 label
          }
        })
        .filter((l): l is string => l !== null),
    ),
  );

  if (validLabels.length === 0) return [];

  const targetNames = validLabels.map((label) => `${label}.eth`);

  const graphQLQuery: GraphQLQueryCode = {
    str: `query getNameRecords($labels: [String!]!, $names: [String!]!) {
      registrations(
        first: ${GRAPHQL_CONFIG.FETCH_LIMIT},
        where: { labelName_in: $labels }
      ) {
        id
        labelName
        expiryDate
        registrationDate
        registrant { id }
      }
      wrappedDomains(
        first: ${GRAPHQL_CONFIG.FETCH_LIMIT},
        where: { name_in: $names }
      ) {
        name
        owner { id }
      }
    }`,
    vars: {
      labels: validLabels,
      names: targetNames,
    },
  };

  try {
    const response = (await queryData(graphQLQuery)) as FetchResponse;
    const { registrations, wrappedDomains } = response;

    const regMap = new Map<string, SubgraphRegistration>();
    registrations.forEach((r) => regMap.set(r.labelName, r));

    const wrapMap = new Map<string, SubgraphWrappedDomain>();
    wrappedDomains.forEach((w) => wrapMap.set(w.name, w));

    return validLabels.map((label) => {
      const registration = regMap.get(label);
      const wrappedDomain = wrapMap.get(`${label}.eth`);

      // ⚡️ 基于 NameRecord 只读字段的初始化
      const baseRecord: Omit<
        NameRecord,
        | "level"
        | "status"
        | "wrapped"
        | "owner"
        | "registeredTime"
        | "expiryTime"
        | "releaseTime"
      > = {
        label: label,
        labelhash: labelhash(label),
        namehash: namehash(`${label}.eth`), // 此时 label 已 normalize 过
        length: label.length,
      };

      if (!registration) {
        return {
          ...baseRecord,
          level: 1,
          status: "Available",
          wrapped: false,
          registeredTime: 0,
          expiryTime: 0,
          releaseTime: 0,
          owner: null,
        } as NameRecord;
      }

      const expiryTime = parseInt(registration.expiryDate);
      const registeredTime = parseInt(registration.registrationDate);
      const releaseTime = expiryTime + DURATION_GRACE_PERIOD;
      const registrantId = registration.registrant.id.toLowerCase();
      const isWrapped = registrantId === WRAPPER_ADDRESS;

      const currentOwner = isWrapped
        ? wrappedDomain?.owner.id || registrantId
        : registrantId;

      return {
        ...baseRecord,
        level: 1,
        status: deriveNameStatus(expiryTime),
        wrapped: isWrapped,
        registeredTime,
        expiryTime,
        releaseTime,
        owner: currentOwner,
      } as NameRecord;
    });
  } catch (error) {
    console.error("批量获取名称记录失败:", error);
    return [];
  }
}
