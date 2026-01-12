// src/utils/ens.ts
import { type Hex, toHex } from "viem";
import { normalize } from "viem/ens";
import type { NameRecord } from "../types/ensNames";
import i18n from "../i18n/config"; // 🚀

export function parseLabel(rawLabel: string): string {
  try {
    return normalize(rawLabel).replace(/\.eth$/, "");
  } catch (error) {
    // 🚀 翻译错误信息
    throw new Error(
      i18n.t("utils.ens.invalid_format", { message: (error as Error).message }),
    );
  }
}

// ... 其他函数保持不变 ...
export function generateSecret(): Hex {
  const randomValues = crypto.getRandomValues(new Uint8Array(32));
  return toHex(randomValues) as unknown as Hex;
}

export const isActive = (status: NameRecord["status"]) => status === "Active";
export const isGrace = (status: NameRecord["status"]) => status === "Grace";
export const isPremium = (status: NameRecord["status"]) => status === "Premium";
export const isReleased = (status: NameRecord["status"]) =>
  status === "Released";
export const isAvailable = (status: NameRecord["status"]) =>
  status === "Available";

export const isRenewable = (status: NameRecord["status"]) =>
  status === "Active" || status === "Grace";

export const isRegistrable = (status: NameRecord["status"]) =>
  status === "Available" || status === "Released" || status === "Premium";

export const fetchPremiumPrice = (
  releaseTime: number,
  decimals: number = 0,
): string => {
  if (!releaseTime) return (0).toFixed(decimals);

  const START_PRICE = 100_000_000;
  const OFFSET = 47.6837158203125;
  const FACTOR = 0.5;

  const now = Date.now();
  const releaseTimeMs = releaseTime * 1000;

  const diffMs = now - releaseTimeMs;
  const daysPassed = diffMs / (24 * 60 * 60 * 1000);

  const currentPremium = START_PRICE * Math.pow(FACTOR, daysPassed) - OFFSET;
  const exactPrice = Math.max(currentPremium, 0);

  return exactPrice.toFixed(decimals);
};
