// src/components/NameTable/types.ts

export type SortField = "label" | "length" | "status" | "owner" | null;
export type SortDirection = "asc" | "desc" | null;
export type DeleteType = "all" | "status" | "length" | "wrapped";

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
  statusList: string[];
  actionType: "all" | "register" | "renew";
  // 🚀 新增字段
  lengthList: number[]; // 选中的长度列表 (空数组表示全选)
  wrappedType: "all" | "wrapped" | "unwrapped"; // 包装状态
}

export const STATUS_OPTIONS = [
  "Available",
  "Premium",
  "Grace",
  "Active",
  "Released",
] as const;
