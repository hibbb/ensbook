import { isRenewable } from "../../utils/ens"; //
import type { NameRecord } from "../../types/ensNames"; //
import type { SortConfig, FilterConfig } from "./types";

// 🚀 状态排序权重：统一管理，保证不同页面排序规则一致
export const STATUS_WEIGHT: Record<string, number> = {
  Available: 1,
  Premium: 2,
  Grace: 3,
  Active: 4,
  Released: 5,
};

/**
 * 🚀 核心逻辑迁移：将数据过滤和排序封装为通用函数
 * 这样后期 Home.tsx 直接调用此函数即可，无需重复编写逻辑
 */
export const processNameRecords = (
  records: NameRecord[] | undefined,
  sortConfig: SortConfig,
  filterConfig: FilterConfig,
  currentAddress?: string,
): NameRecord[] => {
  if (!records) return [];

  // 1. 过滤逻辑
  const filtered = records.filter((r) => {
    // A. 所有者过滤 (安全检查：处理大小写和空值)
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
    const renewable = isRenewable(r);
    if (filterConfig.actionType === "register" && renewable) return false;
    if (filterConfig.actionType === "renew" && !renewable) return false;

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
