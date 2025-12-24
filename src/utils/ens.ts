// src/utils/ens.ts
import { type Hex, toHex } from "viem";
import { normalize } from "viem/ens";
import type { NameRecord } from "../types/ensNames";
import { mainnet } from "viem/chains"; // 🚀 引入 viem 定义的主网 ID

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

// 检查当前是否连接主网，如果未连接钱包 (chainId 为 undefined)，默认返回 true

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
// isRenewable 判断当前用户是否应该看到“更新/续费”按钮
export const isRenewable = (status: NameRecord["status"]) =>
  status === "Active" || status === "Grace";

/**
 * 计算 ENS 域名的当前溢价 (Premium Price)
 * @param releaseTime - 域名的释放时间 (Unix 时间戳，秒)
 * @param decimals -保留的小数位数，默认为 0
 * @returns 格式化后的价格字符串
 */
export const fetchPremiumPrice = (
  releaseTime: number,
  decimals: number = 0,
): string => {
  // 如果没有释放时间，直接返回 0
  if (!releaseTime) return (0).toFixed(decimals);

  const START_PRICE = 100_000_000; // 起始价格 1亿美元
  const OFFSET = 47.6837158203125; // 偏移量，用于修正曲线
  const FACTOR = 0.5; // 衰减因子

  // 使用原生 Date.now() 替代 moment.now()
  // releaseTime 通常是秒，需要转换为毫秒
  const now = Date.now();
  const releaseTimeMs = releaseTime * 1000;

  // 计算距离释放时间过去的天数
  const diffMs = now - releaseTimeMs;
  const daysPassed = diffMs / (24 * 60 * 60 * 1000);

  // 核心公式：Start * (0.5 ^ days) - Offset
  // 使用 Math.max 确保价格不会跌破 0
  const currentPremium = START_PRICE * Math.pow(FACTOR, daysPassed) - OFFSET;
  const exactPrice = Math.max(currentPremium, 0);

  return exactPrice.toFixed(decimals);
};
