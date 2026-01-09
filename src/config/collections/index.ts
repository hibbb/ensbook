// src/config/collections/index.ts

import { type EnsCollection } from "./types";
import { COLLECTION_999_LABELS } from "./data/999";
import { COLLECTION_BIP39_LABELS } from "./data/bip39";

export const ENS_COLLECTIONS: Record<string, EnsCollection> = {
  "999": {
    id: "999",
    // 🚀 替换: "999 Club" -> "collection.999.name"
    displayName: "collection.999.name",
    // 🚀 替换: "ENS most representative..." -> "collection.999.desc"
    description: "collection.999.desc",
    labels: COLLECTION_999_LABELS,
  },
  bip39: {
    id: "bip39",
    // 🚀 替换: "BIP39 Club" -> "collection.bip39.name"
    displayName: "collection.bip39.name",
    // 🚀 替换: "The 2048 foundational..." -> "collection.bip39.desc"
    // // "There are only 2048 keys to the crypto world. Do you own one?",
    description: "collection.bip39.desc",
    labels: COLLECTION_BIP39_LABELS,
  },
};

// 导出类型方便其他地方引用
export * from "./types";
