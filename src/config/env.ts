// src/config/env.ts
import { type Hex, pad } from "viem";

/**
 * 处理 Referrer 地址
 * 逻辑：读取环境变量 -> 如果没有则使用全零地址 -> 确保转换为 32 字节的 Hex 格式
 */
const rawReferrer = "0x9c6aa5ce4903aad922ac4dde9b57817c1fc17d9b";

// 预先计算并导出，Hook 中直接使用，无需重复计算
export const REFERRER_ADDRESS_HASH: Hex = pad(
  rawReferrer.toLowerCase() as Hex,
  {
    size: 32,
  },
);

// Subgraph API Key 配置
const rawSubgraphKey = import.meta.env.VITE_SUBGRAPH_API_KEY;
if (!rawSubgraphKey) {
  // 这里抛出错误是合理的，因为没有它程序无法运行
  throw new Error("缺少 VITE_SUBGRAPH_API_KEY 环境变量");
}
export const SUBGRAPH_API_KEY = rawSubgraphKey;
