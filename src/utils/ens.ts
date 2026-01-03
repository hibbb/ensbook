// src/utils/ens.ts
import { type Hex, toHex } from "viem";
import { normalize } from "viem/ens";
import type { NameRecord } from "../types/ensNames";
import { mainnet } from "viem/chains";

/**
 * 解析并标准化域名
 * 1. 使用 ENS normalize 标准化
 * 2. 移除 .eth 后缀 (防止注册成 alice.eth.eth)
 */
export function parseLabel(rawLabel: string): string {
  try {
    return normalize(rawLabel).replace(/\.eth$/, "");
  } catch (error) {
    throw new Error(`域名格式无效: ${(error as Error).message}`);
  }
}

/**
 * 生成 32 字节的随机 Secret (用于 Commit-Reveal)
 */
export function generateSecret(): Hex {
  const randomValues = crypto.getRandomValues(new Uint8Array(32));
  return toHex(randomValues) as unknown as Hex;
}

export const isMainnet = (chainId?: number): boolean => {
  return !chainId || chainId === mainnet.id;
};

// --- 状态检查工具函数 ---

export const isActive = (status: NameRecord["status"]) => status === "Active";
export const isGrace = (status: NameRecord["status"]) => status === "Grace";
export const isPremium = (status: NameRecord["status"]) => status === "Premium";
export const isReleased = (status: NameRecord["status"]) =>
  status === "Released";
export const isAvailable = (status: NameRecord["status"]) =>
  status === "Available";

// isRenewable 判断当前用户是否应该看到“续费”按钮
export const isRenewable = (status: NameRecord["status"]) =>
  status === "Active" || status === "Grace";

// 🚀 新增：isRegistrable 判断当前用户是否应该看到“注册”按钮
// Premium (溢价期) 也是可以注册的，只是价格不同
export const isRegistrable = (status: NameRecord["status"]) =>
  status === "Available" || status === "Released" || status === "Premium";

/**
 * 计算 ENS 域名的当前溢价 (Premium Price)
 */
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
