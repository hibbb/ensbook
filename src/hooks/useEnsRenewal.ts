// src/hooks/useEnsRenewal.ts

import { useState, useCallback } from "react";
import { usePublicClient, useAccount, useWriteContract } from "wagmi"; // 1. 引入 useWriteContract
import { normalize } from "viem/ens";
import { type Hex } from "viem";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { REFERRER_ADDRESS_HASH } from "../config/constants";
import {
  ethControllerV3Abi, // 2. 引入 ABI (不再引入 useWriteEthControllerV3)
  bulkRenewalAbi, // 2. 引入 ABI (不再引入 useWriteBulkRenewal)
} from "../wagmi-generated";
import { MAINNET_CONTRACTS } from "../config/contracts";

export type RenewalStatus =
  | "idle"
  | "loading"
  | "processing"
  | "success"
  | "error";

export function useEnsRenewal() {
  const [status, setStatus] = useState<RenewalStatus>("idle");
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { t } = useTranslation();

  // 3. 使用通用的 writeContractAsync
  const { writeContractAsync } = useWriteContract();

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
  }, []);

  const renewSingle = useCallback(
    async (rawLabel: string, duration: bigint) => {
      if (!publicClient || !address) {
        toast.error(t("common.connect_wallet"));
        return;
      }

      setStatus("loading");
      setTxHash(null);
      const contractAddress = MAINNET_CONTRACTS.ETH_CONTROLLER_V3;

      try {
        const label = normalize(rawLabel).replace(/\.eth$/, "");
        const referrer = REFERRER_ADDRESS_HASH;

        const priceData = (await publicClient.readContract({
          address: contractAddress,
          abi: ethControllerV3Abi,
          functionName: "rentPrice",
          args: [label, duration],
        })) as { base: bigint; premium: bigint };

        const totalPrice = priceData.base + priceData.premium;
        const valueWithBuffer = (totalPrice * 110n) / 100n;

        // 4. 调用通用方法，传入 ABI 和 Address
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: ethControllerV3Abi,
          functionName: "renew",
          args: [label, duration, referrer],
          value: valueWithBuffer,
        });

        setTxHash(hash);
        setStatus("processing");
        await toast.promise(publicClient.waitForTransactionReceipt({ hash }), {
          loading: t("transaction.toast.confirming"),
          success: t("transaction.toast.success"),
          error: t("transaction.toast.failed"),
        });

        setStatus("success");
      } catch (err: unknown) {
        console.error("单域名续费失败:", err);
        setStatus("error");
        const error = err as Error & { shortMessage?: string };
        toast.error(
          error.shortMessage ||
            error.message ||
            t("transaction.toast.unknown_error"),
        );
      }
    },
    [publicClient, address, writeContractAsync, t], // 依赖项更新
  );

  const renewBatch = useCallback(
    async (
      rawLabels: string[],
      durations: bigint[],
      onSubmitted?: () => void,
    ) => {
      if (!publicClient || !address) {
        toast.error(t("common.connect_wallet"));
        return;
      }
      if (rawLabels.length === 0) {
        toast.error(t("transaction.toast.select_one"));
        return;
      }
      if (rawLabels.length !== durations.length) {
        console.error("Labels and durations length mismatch");
        toast.error(t("transaction.toast.unknown_error"));
        return;
      }

      setStatus("loading");
      const contractAddress = MAINNET_CONTRACTS.BULK_RENEWAL;

      try {
        const labels = rawLabels.map((l) => normalize(l).replace(/\.eth$/, ""));

        const totalPrice = (await publicClient.readContract({
          address: contractAddress,
          abi: bulkRenewalAbi,
          functionName: "rentPrice",
          args: [labels, durations],
        })) as bigint;

        const valueWithBuffer = (totalPrice * 110n) / 100n;

        // 5. 调用通用方法
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: bulkRenewalAbi,
          functionName: "renewAll",
          args: [labels, durations, REFERRER_ADDRESS_HASH],
          value: valueWithBuffer,
        });

        if (onSubmitted) {
          onSubmitted();
        }

        setStatus("processing");
        await toast.promise(publicClient.waitForTransactionReceipt({ hash }), {
          loading: t("transaction.toast.batch_confirming", {
            count: labels.length,
          }),
          success: t("transaction.toast.success"),
          error: t("transaction.toast.failed"),
        });

        setStatus("success");
      } catch (err: unknown) {
        console.error("批量续费失败:", err);
        setStatus("error");
        const error = err as Error & { shortMessage?: string };
        toast.error(
          error.shortMessage ||
            error.message ||
            t("transaction.toast.unknown_error"),
        );
      }
    },
    [publicClient, address, writeContractAsync, t], // 依赖项更新
  );

  return {
    status,
    txHash,
    renewSingle,
    renewBatch,
    resetStatus,
    isBusy: status === "loading" || status === "processing",
  };
}
