// src/utils/fetchPrimaryNames.ts

import { publicClient } from "./client";
import { type Address } from "viem";

// ============================================================================
// 配置常量
// ============================================================================

// 50 是 Viem Multicall 的甜蜜点，能将 50 个查询打包成 1 个 HTTP 请求
const BATCH_SIZE = 50;

// 批次间的强制延迟 (毫秒)，防止击穿 RPC 节点的每秒限制 (CUPS)
const BATCH_DELAY_MS = 100;

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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// 核心逻辑
// ============================================================================

export async function fetchPrimaryNames(
  addresses: string[],
): Promise<Map<string, string>> {
  if (!addresses || addresses.length === 0) return new Map();

  // 1. 去重并格式化地址
  const uniqueAddresses = Array.from(
    new Set(addresses.filter((a) => a).map((a) => a.toLowerCase() as Address)),
  );

  const nameMap = new Map<string, string>();
  const chunks = chunkArray(uniqueAddresses, BATCH_SIZE);

  // console.log(`[ENS] 开始解析 ${uniqueAddresses.length} 个地址，分 ${chunks.length} 批执行...`);

  // 2. 串行执行 (Serial Execution)
  // 使用 for 循环逐个处理 chunk，而不是 Promise.all 并发
  for (let i = 0; i < chunks.length; i++) {
    const batch = chunks[i];

    try {
      // 这一批内的请求会通过 Viem 的 Multicall 自动打包
      const results = await Promise.all(
        batch.map(async (address) => {
          try {
            const name = await publicClient.getEnsName({ address });
            return { address, name };
          } catch (error) {
            // 单个失败不影响整批
            console.warn(`[ENS] 解析失败 ${address}`, error);
            return { address, name: null };
          }
        }),
      );

      // 收集结果
      results.forEach(({ address, name }) => {
        if (name) {
          nameMap.set(address, name);
        }
      });

      // 3. 节奏控制：如果不是最后一批，就休息一下
      if (i < chunks.length - 1) {
        await delay(BATCH_DELAY_MS);
      }
    } catch (batchError) {
      console.error(`[ENS] 第 ${i + 1} 批次发生严重错误:`, batchError);
    }
  }

  return nameMap;
}
