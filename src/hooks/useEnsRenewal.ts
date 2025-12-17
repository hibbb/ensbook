// src/hooks/useEnsRenewal.ts

import { useState, useCallback } from "react";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { type Hex, pad } from "viem";
import { normalize } from "viem/ens";
import toast from "react-hot-toast";
import { MAINNET_ADDRESSES } from "../constants/addresses";
import EthControllerV3ABI from "../abis/EthControllerV3.json";
import BulkRenewalABI from "../abis/BulkRenewal.json";

export type RenewalStatus =
  | "idle"
  | "loading" // 正在估价或等待钱包签名
  | "processing" // 交易已发出，等待上链
  | "success"
  | "error";

// ⚡️ 优化1：将静态逻辑移至 Hook 外部，避免重复创建，保持依赖稳定
const getFormattedReferrer = (): Hex => {
  const rawReferrer =
    import.meta.env.VITE_ENS_REFERRER_HASH ||
    "0x0000000000000000000000000000000000000000";

  // 确保转换为小写并填充到 32 字节 (bytes32)
  return pad(rawReferrer.toLowerCase() as Hex, { size: 32 });
};

export function useEnsRenewal() {
  const [status, setStatus] = useState<RenewalStatus>("idle");
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount(); // ⚡️ 优化2：获取当前用户地址

  // ⚡️ 优化3：提供重置状态的方法，方便 UI 重试
  const resetStatus = useCallback(() => {
    setStatus("idle");
  }, []);

  /**
   * 单域名续费 (EthControllerV3)
   */
  const renewSingle = useCallback(
    async (rawLabel: string, duration: bigint) => {
      // ⚡️ 优化2：增加对 address 的检查
      if (!publicClient || !address) {
        toast.error("请先连接钱包");
        return;
      }

      setStatus("loading");
      const contractAddress = MAINNET_ADDRESSES.ETH_CONTROLLER_V3;

      try {
        const label = normalize(rawLabel).replace(/\.eth$/, "");
        const referrer = getFormattedReferrer();

        // 估价
        const priceData = (await publicClient.readContract({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "rentPrice",
          args: [label, duration],
        })) as { base: bigint; premium: bigint };

        const totalPrice = priceData.base + priceData.premium;
        const valueWithBuffer = (totalPrice * 110n) / 100n; // +10% 缓冲

        // 发送交易
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "renew",
          args: [label, duration, referrer],
          value: valueWithBuffer,
        });

        setStatus("processing");
        await toast.promise(publicClient.waitForTransactionReceipt({ hash }), {
          loading: "续费交易确认中...",
          success: `续费成功！${label}.eth 已更新`,
          error: "续费交易失败",
        });

        setStatus("success");
      } catch (err: unknown) {
        console.error("单域名续费失败:", err);
        setStatus("error");
        const error = err as Error & { shortMessage?: string };
        toast.error(error.shortMessage || error.message || "续费发生未知错误");
      }
    },
    [publicClient, address, writeContractAsync], // 依赖列表现在是准确的
  );

  /**
   * 批量续费 (BulkRenewal)
   */
  const renewBatch = useCallback(
    async (rawLabels: string[], duration: bigint) => {
      if (!publicClient || !address) {
        toast.error("请先连接钱包");
        return;
      }
      if (rawLabels.length === 0) {
        toast.error("请至少选择一个域名");
        return;
      }

      setStatus("loading");
      const contractAddress = MAINNET_ADDRESSES.BULK_RENEWAL;

      try {
        const labels = rawLabels.map((l) => normalize(l).replace(/\.eth$/, ""));

        // 估价 (BulkRenewal 直接返回总价)
        const totalPrice = (await publicClient.readContract({
          address: contractAddress,
          abi: BulkRenewalABI,
          functionName: "rentPrice",
          args: [labels, duration],
        })) as bigint;

        const valueWithBuffer = (totalPrice * 110n) / 100n;

        // 发送交易
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: BulkRenewalABI,
          functionName: "renewAll",
          args: [labels, duration],
          value: valueWithBuffer,
        });

        setStatus("processing");
        await toast.promise(publicClient.waitForTransactionReceipt({ hash }), {
          loading: `正在批量续费 ${labels.length} 个域名...`,
          success: "批量续费成功！",
          error: "批量续费交易失败",
        });

        setStatus("success");
      } catch (err: unknown) {
        console.error("批量续费失败:", err);
        setStatus("error");
        const error = err as Error & { shortMessage?: string };
        toast.error(
          error.shortMessage || error.message || "批量续费发生未知错误",
        );
      }
    },
    [publicClient, address, writeContractAsync],
  );

  return {
    status,
    renewSingle,
    renewBatch,
    resetStatus, // 导出重置方法
    isBusy: status === "loading" || status === "processing",
  };
}
