// src/utils/fetchPrimaryNames.ts

import { publicClient } from "./client";
import { type Address } from "viem";

// ============================================================================
// 配置常量
// ============================================================================

// 公共节点通常建议控制在 20-30 左右
const BATCH_SIZE = 50;

// 保持串行或极低并发是公共节点稳定运行的关键
const CONCURRENCY_LIMIT = 5;

// ============================================================================
// 辅助函数
// ============================================================================

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ============================================================================
// 核心逻辑
// ============================================================================

export async function fetchPrimaryNames(
  addresses: string[],
): Promise<Map<string, string>> {
  if (!addresses || addresses.length === 0) return new Map();

  const uniqueAddresses = Array.from(
    new Set(addresses.filter((a) => a).map((a) => a.toLowerCase() as Address)),
  );

  const nameMap = new Map<string, string>();
  const chunks = chunkArray(uniqueAddresses, BATCH_SIZE);

  for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
    const activeBatches = chunks.slice(i, i + CONCURRENCY_LIMIT);

    const batchPromises = activeBatches.map(async (batch) => {
      // 使用 try-catch 包裹整个 Promise.all，防止某一个批次炸裂影响其他批次
      try {
        const results = await Promise.all(
          batch.map(async (address) => {
            try {
              const name = await publicClient.getEnsName({ address });
              return { address, name };
            } catch (error) {
              // 单个域名解析失败，不要抛出，返回 null 即可
              console.warn(`[ENS] 解析失败 ${address}:`, error);
              return { address, name: null };
            }
          }),
        );

        results.forEach(({ address, name }) => {
          if (name) {
            nameMap.set(address, name);
          }
        });
      } catch (batchError) {
        console.error("[ENS] 批次请求严重错误:", batchError);
      }
    });

    // 适当增加延迟，给 RPC 节点喘息时间（可选，这里通过 await 控制节奏）
    await Promise.all(batchPromises);
  }

  return nameMap;
}
