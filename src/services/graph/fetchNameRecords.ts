// src/utils/fetchNameRecords.ts

import { labelhash } from "viem";
import { queryData, type GraphQLQueryCode } from "./client";
import type { NameRecord } from "../../types/ensNames";
import { getContracts } from "../../config/contracts";
import { GRAPHQL_CONFIG } from "../../config/constants";

// ============================================================================
// 1. 内部逻辑常量
// ============================================================================

const DURATION_GRACE_PERIOD = 90 * 24 * 60 * 60; // 90天宽限期
const DURATION_PREMIUM_PERIOD = 21 * 24 * 60 * 60; // 21天溢价期

const contracts = getContracts(1);
const WRAPPER_ADDRESS = contracts.ENS_NAME_WRAPPER.toLowerCase();

// ============================================================================
// 2. 类型定义 (GraphQL 响应)
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

// ============================================================================
// 3. 辅助函数
// ============================================================================

/**
 * 推导域名状态
 */
function deriveNameStatus(expiryTimestamp: number): NameRecord["status"] {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const gracePeriodEnd = expiryTimestamp + DURATION_GRACE_PERIOD;
  const premiumPeriodEnd = gracePeriodEnd + DURATION_PREMIUM_PERIOD;

  if (currentTimestamp <= expiryTimestamp) {
    return "Active";
  } else if (currentTimestamp <= gracePeriodEnd) {
    return "GracePeriod";
  } else if (currentTimestamp <= premiumPeriodEnd) {
    return "PremiumPeriod";
  } else {
    return "Released";
  }
}

// ============================================================================
// 4. 主函数逻辑
// ============================================================================

export async function fetchNameRecords(
  labels: string[],
): Promise<NameRecord[]> {
  // 1. 基础防御
  if (!labels || labels.length === 0) return [];

  // 2. 清洗输入：去空、去重、转小写 (确保 Map 键值匹配)
  // ⚡️ 优化：增加 toLowerCase 防止大小写不一致导致匹配失败
  const validLabels = Array.from(
    new Set(
      labels
        .filter((l) => l && l.trim().length > 0)
        .map((l) => l.trim().toLowerCase()),
    ),
  );

  const targetNames = validLabels.map((label) => `${label}.eth`);

  // 3. 构造查询
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

    // 4. ⚡️ 性能优化：建立哈希映射 (Hash Map)
    // 将 O(N*M) 的查找复杂度降低为 O(N)
    const regMap = new Map<string, SubgraphRegistration>();
    registrations.forEach((r) => regMap.set(r.labelName, r));

    const wrapMap = new Map<string, SubgraphWrappedDomain>();
    wrappedDomains.forEach((w) => wrapMap.set(w.name, w));

    // 5. 映射结果
    return validLabels.map((label) => {
      // O(1) 快速查找
      const registration = regMap.get(label);
      const wrappedDomain = wrapMap.get(`${label}.eth`);

      // 默认基础模板 (Available)
      const baseRecord: NameRecord = {
        label: label,
        length: label.length,
        level: 1,
        status: "Available",
        tokenId: labelhash(label),
        wrapped: false,
        registeredTime: 0,
        expiryTime: 0,
        releaseTime: 0,
        owner: null,
      };

      if (!registration) {
        return baseRecord;
      }

      // 数据解析
      const expiryTime = parseInt(registration.expiryDate);
      const registeredTime = parseInt(registration.registrationDate);
      const releaseTime = expiryTime + DURATION_GRACE_PERIOD;

      const registrantId = registration.registrant.id.toLowerCase();

      // 判断 Wrap 状态
      const isWrapped = registrantId === WRAPPER_ADDRESS;

      // 确定所有者
      // 逻辑：如果 Wrap 了，尝试取 wrappedOwner，取不到回退 registrant (Wrapper合约地址)
      const currentOwner = isWrapped
        ? wrappedDomain?.owner.id || registrantId
        : registrantId;

      return {
        ...baseRecord,
        status: deriveNameStatus(expiryTime),
        tokenId: registration.id,
        wrapped: isWrapped,
        registeredTime: registeredTime,
        expiryTime: expiryTime,
        releaseTime: releaseTime,
        owner: currentOwner,
      };
    });
  } catch (error) {
    console.error("批量获取名称记录失败:", error);
    return [];
  }
}
