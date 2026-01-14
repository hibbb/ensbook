// src/components/NameTable/utils.ts

import { isRenewable, isRegistrable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";
import type { SortConfig, FilterConfig } from "./types";

export const processNameRecords = (
  records: NameRecord[] | undefined,
  sortConfig: SortConfig,
  filterConfig: FilterConfig,
): NameRecord[] => {
  if (!records) return [];

  // 1. 过滤逻辑
  const filtered = records.filter((r) => {
    // A. 所有者列表过滤 (现在是主要逻辑)
    if (filterConfig.ownerList.length > 0) {
      if (!r.owner) return false;
      if (!filterConfig.ownerList.includes(r.owner.toLowerCase())) return false;
    }

    // ... 后续逻辑保持不变 (status, action, memo, length, wrapped, level)
    if (
      filterConfig.statusList.length > 0 &&
      !filterConfig.statusList.includes(r.status)
    ) {
      return false;
    }

    if (filterConfig.actionType !== "all") {
      if (filterConfig.actionType === "renew" && !isRenewable(r.status)) {
        return false;
      }
      if (filterConfig.actionType === "register" && !isRegistrable(r.status)) {
        return false;
      }
    }

    if (filterConfig.onlyWithMemos) {
      if (!r.memo || r.memo.trim().length === 0) return false;
    }

    if (
      filterConfig.lengthList.length > 0 &&
      !filterConfig.lengthList.includes(r.label.length)
    ) {
      return false;
    }

    if (filterConfig.wrappedType !== "all") {
      if (filterConfig.wrappedType === "wrapped" && !r.wrapped) return false;
      if (filterConfig.wrappedType === "unwrapped" && r.wrapped) return false;
    }

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
