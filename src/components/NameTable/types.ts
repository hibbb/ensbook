// src/components/NameTable/types.ts

export type DeleteType = "all" | "status" | "length" | "wrapped" | "owner";

// 🚀 新增 "registered" 排序字段
export type SortField =
  | "label"
  | "length"
  | "status"
  | "owner"
  | "registered"
  | null;
export type SortDirection = "asc" | "desc" | null;

export interface DeleteCriteria {
  type: DeleteType;
  value?: string | number | boolean;
}

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  onlyMe: boolean;
  // 🚀 新增 "仅显示有备注" 筛选配置
  onlyWithMemos: boolean;
  statusList: string[];
  actionType: "all" | "register" | "renew";
  lengthList: number[];
  wrappedType: "all" | "wrapped" | "unwrapped";
}

export const STATUS_OPTIONS = [
  "Available",
  "Premium",
  "Grace",
  "Active",
  "Released",
  "Unknown",
] as const;
