// src/utils/collectionMatcher.ts
import { COLLECTION_BIP39_LABELS } from "../config/collections/data/bip39";
import { COLLECTION_999_LABELS } from "../config/collections/data/999";

const bip39Set = new Set(COLLECTION_BIP39_LABELS);
const c999Set = new Set(COLLECTION_999_LABELS);

export type CollectionTag = "bip39" | "999";

export const getCollectionTag = (label: string): CollectionTag[] => {
  const tags: CollectionTag[] = [];
  const normalized = label.toLowerCase();

  if (bip39Set.has(normalized)) tags.push("bip39");
  // 确保这里开启了 999 的匹配
  if (c999Set.has(normalized)) tags.push("999");

  return tags;
};
