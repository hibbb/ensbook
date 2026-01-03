// src/config/collections/data/999.ts

/**
 * 自动生成 000-999 的纯数字 labels
 */
export const COLLECTION_999_LABELS = Array.from({ length: 1000 }, (_, i) =>
  i.toString().padStart(3, "0"),
);
