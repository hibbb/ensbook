import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

/**
 * 🚀 创建全局公用客户端 (Public Client)
 * 用于执行 getEnsName (反向解析) 等 RPC 调用
 */
export const publicClient = createPublicClient({
  chain: mainnet, // 默认连接主网
  transport: http(), // 可以在此处填入 Alchemy/Infura 的 RPC URL 提高稳定性
  batch: {
    multicall: true, // 🚀 开启自动批处理，优化 Promise.all 的性能
  },
});
