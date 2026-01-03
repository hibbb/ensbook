// src/components/NameTable/types.ts

export type DeleteType = "all" | "status" | "length" | "wrapped" | "owner";

export type SortField = "label" | "length" | "status" | "owner" | null;
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
  statusList: string[];
  actionType: "all" | "register" | "renew";
  lengthList: number[];
  wrappedType: "all" | "wrapped" | "unwrapped";
}

// 🚀 核心修改：添加 "Unknown"
export const STATUS_OPTIONS = [
  "Available",
  "Premium",
  "Grace",
  "Active",
  "Released",
  "Unknown", // 必需保留在类型定义中，但在 UI 层根据数量决定是否显示
] as const;
