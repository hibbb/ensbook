import { type PublicClient, TransactionReceiptNotFoundError } from "viem";
import { type Hex } from "viem";

export type TransactionState =
  | "confirmed"
  | "reverted"
  | "pending"
  | "not_found";

export interface TxStatusResult {
  state: TransactionState;
  timestamp?: number;
  blockNumber?: bigint;
}

export async function checkTxStatus(
  publicClient: PublicClient,
  txHash?: Hex,
): Promise<TxStatusResult> {
  if (!txHash) return { state: "not_found" };

  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

    if (receipt.status === "reverted") {
      return { state: "reverted" };
    }

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
        await publicClient.getTransaction({ hash: txHash });
        return { state: "pending" };
      } catch {
        return { state: "not_found" };
      }
    }
    console.warn("检查交易状态时发生未知错误:", error);
    return { state: "pending" };
  }
}
