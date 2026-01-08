// src/components/NameTable/utils.ts

import { isRenewable, isRegistrable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";
import type { SortConfig, FilterConfig } from "./types";

export const processNameRecords = (
  records: NameRecord[] | undefined,
  sortConfig: SortConfig,
  filterConfig: FilterConfig,
  currentAddress?: string,
): NameRecord[] => {
  if (!records) return [];

  // 1. 过滤逻辑
  const filtered = records.filter((r) => {
    // A. 所有者过滤
    if (filterConfig.onlyMe) {
      if (!currentAddress || !r.owner) return false;
      if (r.owner.toLowerCase() !== currentAddress.toLowerCase()) return false;
    }

    // B. 状态多选过滤
    if (
      filterConfig.statusList.length > 0 &&
      !filterConfig.statusList.includes(r.status)
    ) {
      return false;
    }

    // C. 操作类型过滤
    if (filterConfig.actionType !== "all") {
      if (filterConfig.actionType === "renew" && !isRenewable(r.status)) {
        return false;
      }
      if (filterConfig.actionType === "register" && !isRegistrable(r.status)) {
        return false;
      }
    }

    // D. 备注过滤
    if (filterConfig.onlyWithMemos) {
      if (!r.memo || r.memo.trim().length === 0) return false;
    }

    // E. 长度过滤
    if (
      filterConfig.lengthList.length > 0 &&
      !filterConfig.lengthList.includes(r.label.length)
    ) {
      return false;
    }

    // F. 包装状态过滤
    if (filterConfig.wrappedType !== "all") {
      if (filterConfig.wrappedType === "wrapped" && !r.wrapped) return false;
      if (filterConfig.wrappedType === "unwrapped" && r.wrapped) return false;
    }

    // 🚀 G. 等级过滤 (新增)
    if (
      filterConfig.levelList.length > 0 &&
      !filterConfig.levelList.includes(r.level || 0)
    ) {
      return false;
    }

    return true;
  });

  // 2. 排序逻辑
  const { field, direction } = sortConfig;
  if (!field || !direction) return filtered;

  const getSortValue = (r: NameRecord): string | number => {
    switch (field) {
      case "label":
        return r.label;
      case "length":
        return r.label.length;
      case "status":
        return r.expiryTime || r.releaseTime || 0;
      case "registered":
        return r.registeredTime || 0;
      case "owner":
        return r.ownerPrimaryName || r.owner || "";
      // 🚀 Level 排序: 降序时红色(3)在前
      case "level":
        return r.level || 0;
      default:
        return "";
    }
  };

  return [...filtered].sort((a, b) => {
    const valA = getSortValue(a);
    const valB = getSortValue(b);

    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });
};
