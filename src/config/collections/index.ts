// src/config/collections/index.ts

import { type EnsCollection } from "./types";
import { COLLECTION_999_LABELS } from "./data/999";
import { COLLECTION_BIP39_LABELS } from "./data/bip39";

export const ENS_COLLECTIONS: Record<string, EnsCollection> = {
  "999": {
    id: "999",
    displayName: "999 Club",
    description: "ENS 最具代表性的数字集合，包含 000.eth 到 999.eth。",
    labels: COLLECTION_999_LABELS,
  },
  bip39: {
    id: "bip39",
    displayName: "BIP39 Club",
    description:
      "The 2048 foundational words of crypto wallets (Mnemonic Seeds).",
    // "There are only 2048 keys to the crypto world. Do you own one?",
    labels: COLLECTION_BIP39_LABELS,
  },
};

// 导出类型方便其他地方引用
export * from "./types";
