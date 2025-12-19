// src/config/collections/index.ts

import { type EnsCollection } from "./types";
import { CLUB_999_LABELS } from "./data/999-club";
import { MNEMONIC_LABELS } from "./data/mnemonic";

export const ENS_COLLECTIONS: Record<string, EnsCollection> = {
  "999-club": {
    id: "999-club",
    displayName: "999 Club",
    description: "ENS 最具代表性的数字集合，包含 000.eth 到 999.eth。",
    labels: CLUB_999_LABELS,
  },
  "mnemonic-club": {
    id: "mnemonic-club",
    displayName: "Mnemonic Club",
    description: "基于 BIP-39 标准词库的助记词域名集合。",
    labels: MNEMONIC_LABELS,
  },
};

// 导出类型方便其他地方引用
export * from "./types";
