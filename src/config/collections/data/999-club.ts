// src/config/collections/data/999-club.ts

/**
 * 自动生成 000-999 的纯数字 labels
 */
export const CLUB_999_LABELS = Array.from({ length: 50 }, (_, i) =>
  i.toString().padStart(3, "0"),
);
