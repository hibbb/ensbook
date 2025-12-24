// src/utils/fetchPrimaryNames.ts

import { publicClient } from "./client";
import { type Address } from "viem";

// ============================================================================
// 配置常量
// ============================================================================

// 单次 Multicall 的大小 (Viem 会自动将这些请求打包为一个 eth_call)
const BATCH_SIZE = 100;

// 并发控制：同时发出的 HTTP 请求批次数量
// 5 * 100 = 瞬间最多处理 500 个地址，既利用了带宽又不会触发 429 错误
const CONCURRENCY_LIMIT = 5;

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 数组分块工具
 */
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

/**
 * 🚀 独立封装的反向解析工具
 *
 * 功能：
 * 1. 批量获取 Address 对应的 Primary ENS Name (如 vitalik.eth)
 * 2. 内置并发控制 (Concurrency Control)，适合处理 1000+ 条数据
 * 3. 自动进行正向校验 (Forward Check)，由 viem 底层保证
 */
export async function fetchPrimaryNames(
  addresses: string[],
): Promise<Map<string, string>> {
  // 1. 边界检查
  if (!addresses || addresses.length === 0) return new Map();

  // 2. 数据清洗：去重、转小写、转 Address 类型
  const uniqueAddresses = Array.from(
    new Set(addresses.filter((a) => a).map((a) => a.toLowerCase() as Address)),
  );

  const nameMap = new Map<string, string>();

  // 3. 将所有地址切分成小块 (Address[][])
  const chunks = chunkArray(uniqueAddresses, BATCH_SIZE);

  // 4. 执行并发请求，但通过滑动窗口限制并发数
  for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
    // 取出当前要并发执行的几个批次 (例如 index 0~4)
    const activeBatches = chunks.slice(i, i + CONCURRENCY_LIMIT);

    // 并行处理这几个批次
    const batchPromises = activeBatches.map(async (batch) => {
      // 这里的 map 会生成 100 个 getEnsName 调用
      // publicClient 配置了 batch.multicall，viem 会自动将它们合并
      const results = await Promise.all(
        batch.map(async (address) => {
          try {
            const name = await publicClient.getEnsName({ address });
            return { address, name };
          } catch (error) {
            console.log(`获取 ${address} 对应的名称失败： ${error}`);
            // 单个失败不应影响整体，静默失败即可
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
    });

    // ⚡️ 关键：等待这一组并发任务全部完成，再进行下一组
    await Promise.all(batchPromises);
  }

  return nameMap;
}
