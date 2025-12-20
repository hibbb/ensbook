// src/utils/ens.ts
import { type Hex, toHex } from "viem";
import { normalize } from "viem/ens";
import type { NameRecord } from "../types/ensNames";

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

/**
 * 判断当前用户是否应该看到“更新/续费”按钮
 * * 逻辑：
 * 1. Active: 正常使用中，可以续费以延长租期
 * 2. GracePeriod: 已过期但处于宽限期，原主人仍可续费挽回
 */
export function isRenewable(record: NameRecord): boolean {
  return record.status === "Active" || record.status === "GracePeriod";
}
