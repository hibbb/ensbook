// src/components/NameTable/types.ts

export type SortField = "label" | "length" | "status" | null;
export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  onlyMe: boolean;
  statusList: string[];
  actionType: "all" | "register" | "renew";
}

export const STATUS_OPTIONS = [
  "Available",
  "Premium",
  "Grace",
  "Active",
  "Released",
] as const;
