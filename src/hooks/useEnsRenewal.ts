// src/hooks/useEnsRenewal.ts

import { useState, useCallback } from "react";
import { usePublicClient, useAccount, useChainId } from "wagmi";
import { normalize } from "viem/ens";
import { type Hex } from "viem"; // 引入 Hex 类型
import toast from "react-hot-toast";
import { REFERRER_ADDRESS_HASH } from "../config/env";
import {
  useWriteEthControllerV3,
  useWriteBulkRenewal,
  ethControllerV3Abi,
  bulkRenewalAbi,
} from "../wagmi-generated";
import { getContracts } from "../config/contracts";

export type RenewalStatus =
  | "idle"
  | "loading" // 正在估价或等待钱包签名
  | "processing" // 交易已发出，等待上链
  | "success"
  | "error";

export function useEnsRenewal() {
  const [status, setStatus] = useState<RenewalStatus>("idle");
  const [txHash, setTxHash] = useState<Hex | null>(null); // 🚀 新增：交易哈希状态
  const publicClient = usePublicClient();
  const { address } = useAccount(); // ⚡️ 优化2：获取当前用户地址
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  // 使用生成的 Write Hooks
  const { writeContractAsync: writeEthController } = useWriteEthControllerV3();
  const { writeContractAsync: writeBulkRenewal } = useWriteBulkRenewal();

  // ⚡️ 优化3：提供重置状态的方法，方便 UI 重试
  const resetStatus = useCallback(() => {
    setStatus("idle");
    setTxHash(null); // 重置哈希
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
      setTxHash(null);
      const contractAddress = contracts.ETH_CONTROLLER_V3;

      try {
        const label = normalize(rawLabel).replace(/\.eth$/, "");
        const referrer = REFERRER_ADDRESS_HASH;

        // 估价
        const priceData = (await publicClient.readContract({
          address: contractAddress,
          abi: ethControllerV3Abi,
          functionName: "rentPrice",
          args: [label, duration],
        })) as { base: bigint; premium: bigint };

        const totalPrice = priceData.base + priceData.premium;
        const valueWithBuffer = (totalPrice * 110n) / 100n; // +10% 缓冲

        // 发送交易
        const hash = await writeEthController({
          functionName: "renew",
          args: [label, duration, referrer],
          value: valueWithBuffer,
        });

        setTxHash(hash); // 🚀 保存哈希
        setStatus("processing");
        await toast.promise(publicClient.waitForTransactionReceipt({ hash }), {
          loading: "续费交易确认中...",
          success: `续费成功！${label}.eth 已续费。`,
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
    [publicClient, address, writeEthController, contracts], // 依赖列表现在是准确的
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
      const contractAddress = contracts.BULK_RENEWAL;

      try {
        const labels = rawLabels.map((l) => normalize(l).replace(/\.eth$/, ""));

        // 估价 (BulkRenewal 直接返回总价)
        const totalPrice = (await publicClient.readContract({
          address: contractAddress,
          abi: bulkRenewalAbi,
          functionName: "rentPrice",
          args: [labels, duration],
        })) as bigint;

        const valueWithBuffer = (totalPrice * 110n) / 100n;

        // 发送交易
        const hash = await writeBulkRenewal({
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
    [publicClient, address, writeBulkRenewal, contracts],
  );

  return {
    status,
    txHash, // 🚀 导出哈希
    renewSingle,
    renewBatch,
    resetStatus, // 导出重置方法
    isBusy: status === "loading" || status === "processing",
  };
}
