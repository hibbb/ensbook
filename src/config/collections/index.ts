// src/config/collections/index.ts

import { type EnsCollection } from "./types";
import { COLLECTION_999_LABELS } from "./data/999";
import { COLLECTION_BIP39_LABELS } from "./data/bip39";

export const ENS_COLLECTIONS: Record<string, EnsCollection> = {
  "999": {
    id: "999",
    displayName: "collection.999.title",
    description: "collection.999.desc",
    labels: COLLECTION_999_LABELS,
  },
  bip39: {
    id: "bip39",
    displayName: "collection.bip39.title",
    description: "collection.bip39.desc",
    labels: COLLECTION_BIP39_LABELS,
  },
};

// 导出类型方便其他地方引用
export * from "./types";
