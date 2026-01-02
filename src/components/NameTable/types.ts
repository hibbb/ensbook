// src/components/NameTable/types.ts

// 🚀 修改：增加 "owner" 类型
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

export const STATUS_OPTIONS = [
  "Available",
  "Premium",
  "Grace",
  "Active",
  "Released",
] as const;
