// src/config/collections/index.ts

import { type EnsCollection } from "./types";
import { COLLECTION_999_LABELS } from "./data/999";
import { COLLECTION_MNEMONIC_LABELS } from "./data/mnemonic";

export const ENS_COLLECTIONS: Record<string, EnsCollection> = {
  "999": {
    id: "999",
    displayName: "999 Collection",
    description: "ENS 最具代表性的数字集合，包含 000.eth 到 999.eth。",
    labels: COLLECTION_999_LABELS,
  },
  mnemonic: {
    id: "mnemonic",
    displayName: "Mnemonic Collection",
    description: "基于 BIP-39 标准词库的助记词域名集合。",
    labels: COLLECTION_MNEMONIC_LABELS,
  },
};

// 导出类型方便其他地方引用
export * from "./types";
