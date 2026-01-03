// src/components/NameTable/utils.ts

import { isRenewable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";
import type { SortConfig, FilterConfig } from "./types";

export const STATUS_WEIGHT: Record<string, number> = {
  Available: 1,
  Premium: 2,
  Grace: 3,
  Active: 4,
  Released: 5,
};

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
    const renewable = isRenewable(r.status);
    if (filterConfig.actionType === "register" && renewable) return false;
    if (filterConfig.actionType === "renew" && !renewable) return false;

    // D. 备注过滤
    if (filterConfig.onlyWithNotes) {
      if (!r.notes || r.notes.trim().length === 0) return false;
    }

    // 🚀 修复 E: 长度过滤 (补回遗漏逻辑)
    if (
      filterConfig.lengthList.length > 0 &&
      !filterConfig.lengthList.includes(r.label.length)
    ) {
      return false;
    }

    // 🚀 修复 F: 包装状态过滤 (补回遗漏逻辑)
    if (filterConfig.wrappedType !== "all") {
      if (filterConfig.wrappedType === "wrapped" && !r.wrapped) return false;
      if (filterConfig.wrappedType === "unwrapped" && r.wrapped) return false;
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
        // 按过期时间排序
        return r.expiryTime || r.releaseTime || 0;
      case "registered":
        // 按注册时间排序
        return r.registeredTime || 0;
      case "owner":
        return r.ownerPrimaryName || r.owner || "";
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
