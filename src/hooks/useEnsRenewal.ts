// src/hooks/useEnsRenewal.ts

import { useState, useCallback } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { normalize } from "viem/ens";
import { type Hex } from "viem";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { REFERRER_ADDRESS_HASH } from "../config/env";
import {
  useWriteEthControllerV3,
  useWriteBulkRenewal,
  ethControllerV3Abi,
  bulkRenewalAbi,
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

  const { writeContractAsync: writeEthController } = useWriteEthControllerV3();
  const { writeContractAsync: writeBulkRenewal } = useWriteBulkRenewal();

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
  }, []);

  const renewSingle = useCallback(
    async (rawLabel: string, duration: bigint) => {
      if (!publicClient || !address) {
        // 🚀 替换: hooks.renewal.connect_wallet -> common.connect_wallet
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

        const hash = await writeEthController({
          functionName: "renew",
          args: [label, duration, referrer],
          value: valueWithBuffer,
        });

        setTxHash(hash);
        setStatus("processing");
        await toast.promise(publicClient.waitForTransactionReceipt({ hash }), {
          // 🚀 替换: hooks.renewal.confirming -> transaction.toast.confirming
          loading: t("transaction.toast.confirming"),
          // 🚀 替换: hooks.renewal.success -> transaction.toast.success
          success: t("transaction.toast.success"),
          // 🚀 替换: hooks.renewal.failed -> transaction.toast.failed
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
            // 🚀 替换: hooks.renewal.unknown_error -> transaction.toast.unknown_error
            t("transaction.toast.unknown_error"),
        );
      }
    },
    [publicClient, address, writeEthController, t],
  );

  const renewBatch = useCallback(
    async (rawLabels: string[], duration: bigint) => {
      if (!publicClient || !address) {
        // 🚀 替换: hooks.renewal.connect_wallet -> common.connect_wallet
        toast.error(t("common.connect_wallet"));
        return;
      }
      if (rawLabels.length === 0) {
        // 🚀 替换: hooks.renewal.select_one -> transaction.toast.select_one
        toast.error(t("transaction.toast.select_one"));
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
          args: [labels, duration],
        })) as bigint;

        const valueWithBuffer = (totalPrice * 110n) / 100n;

        const hash = await writeBulkRenewal({
          functionName: "renewAll",
          args: [labels, duration],
          value: valueWithBuffer,
        });

        setStatus("processing");
        await toast.promise(publicClient.waitForTransactionReceipt({ hash }), {
          // 🚀 替换: hooks.renewal.batch_confirming -> transaction.toast.batch_confirming
          loading: t("transaction.toast.batch_confirming", {
            count: labels.length,
          }),
          // 🚀 替换: hooks.renewal.batch_success -> transaction.toast.success
          success: t("transaction.toast.success"),
          // 🚀 替换: hooks.renewal.batch_failed -> transaction.toast.failed
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
            // 🚀 替换: hooks.renewal.batch_unknown_error -> transaction.toast.unknown_error
            t("transaction.toast.unknown_error"),
        );
      }
    },
    [publicClient, address, writeBulkRenewal, t],
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
