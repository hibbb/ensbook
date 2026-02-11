// src/components/NameTable/types.ts

export type DeleteType = "all" | "status" | "length" | "wrapped" | "owner";

export type SortField =
  | "label"
  | "length"
  | "status"
  | "owner"
  | "registered"
  | "level"
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
  statusList: string[];
  memoFilter: "all" | "with_memo" | "no_memo";
  actionType: "all" | "register" | "renew";
  lengthList: number[];
  wrappedType: "all" | "wrapped" | "unwrapped";
  levelList: number[];
  ownerList: string[];
}

export const STATUS_OPTIONS = [
  "Available",
  "Premium",
  "Grace",
  "Active",
  "Released",
  "Unknown",
] as const;

export const LEVEL_OPTIONS = [
  { value: 0, label: "Default", color: "bg-gray-100 text-gray-500" },
  { value: 1, label: "Blue", color: "bg-blue-50 text-blue-600" },
  { value: 2, label: "Yellow", color: "bg-yellow-50 text-yellow-600" },
  { value: 3, label: "Red", color: "bg-red-50 text-red-600" },
];
