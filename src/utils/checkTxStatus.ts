// src/utils/checkTxStatus.ts

import {
  type PublicClient,
  type Hex,
  TransactionReceiptNotFoundError,
} from "viem";

export type TransactionState =
  | "confirmed" // 已上链且执行成功
  | "reverted" // 已上链但执行失败
  | "pending" // 内存池中或未找到回执 (视作进行中)
  | "not_found"; // 彻底找不到 (可能是无效 Hash)

export interface TxStatusResult {
  state: TransactionState;
  timestamp?: number; // 只有 confirmed 状态才会有时间戳 (秒)
  blockNumber?: bigint;
}

/**
 * 检查链上交易状态及时间戳
 * 用于断点续传时恢复进度
 * * @param publicClient Viem/Wagmi 的 PublicClient
 * @param txHash 交易哈希
 */
export async function checkTxStatus(
  publicClient: PublicClient,
  txHash?: Hex,
): Promise<TxStatusResult> {
  if (!txHash) return { state: "not_found" };

  try {
    // 1. 尝试获取交易回执 (Receipt)
    // 这里的 waitFor 不是为了等待，而是为了复用 viem 的获取逻辑
    // 如果只想查一次状态，用 getTransactionReceipt 即可
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

    // 2. 判断执行状态
    if (receipt.status === "reverted") {
      return { state: "reverted" };
    }

    // 3. 如果成功，获取区块时间 (为了恢复倒计时)
    // 只有在 "success" 时我们需要时间戳
    let timestamp: number | undefined;
    try {
      const block = await publicClient.getBlock({
        blockNumber: receipt.blockNumber,
      });
      timestamp = Number(block.timestamp);
    } catch (e) {
      console.warn("获取区块时间失败，使用当前时间估算:", e);
      timestamp = Math.floor(Date.now() / 1000);
    }

    return {
      state: "confirmed",
      timestamp,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    if (error instanceof TransactionReceiptNotFoundError) {
      try {
        // 只要这行代码不报错，就说明交易存在（Pending），我们不需要具体的 tx 数据
        await publicClient.getTransaction({ hash: txHash });
        return { state: "pending" };
      } catch {
        // 既没 Receipt 也没 Transaction，说明彻底找不到
        return { state: "not_found" };
      }
    }

    console.warn("检查交易状态时发生未知错误:", error);
    return { state: "pending" };
  }
}
