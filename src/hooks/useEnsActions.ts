// src/hooks/useEnsActions.ts

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { type Address } from "viem";
import { useAccount } from "wagmi"; // 🚀

import { useEnsRenewal } from "./useEnsRenewal";
import { useEnsRegistration } from "./useEnsRegistration";
import { getAllPendingLabels } from "../services/storage/registration";
import { useOptimisticNameUpdate } from "./useOptimisticNameUpdate"; // 🚀

import type { NameRecord } from "../types/ensNames";
import type { ProcessType } from "../components/ProcessModal";

export const useEnsActions = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { address } = useAccount(); // 🚀 获取当前连接钱包，作为注册默认 Owner

  // 🚀 引入乐观更新 Hook
  const { updateRenewal, updateRegistration } = useOptimisticNameUpdate();

  const [durationTarget, setDurationTarget] = useState<{
    type: ProcessType;
    record?: NameRecord;
    labels?: string[];
    expiryTimes?: number[];
    onSuccess?: () => void;
    // 🚀 新增：暂存用户提交的参数，用于后续更新 UI
    pendingDurations?: bigint[];
    pendingOwner?: string;
  } | null>(null);

  const [reminderTarget, setReminderTarget] = useState<NameRecord | null>(null);
  const [pendingLabels, setPendingLabels] = useState<Set<string>>(new Set());

  const {
    renewSingle,
    renewBatch,
    status: renewalStatus,
    txHash: renewalTxHash,
    resetStatus: resetRenewal,
    isBusy: isRenewalBusy,
  } = useEnsRenewal();

  const {
    startRegistration,
    status: regStatus,
    secondsLeft,
    currentHash: regTxHash,
    resetStatus: resetReg,
    checkAndResume,
    startResuming,
  } = useEnsRegistration();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPendingLabels(getAllPendingLabels());
    }, 0);
    return () => clearTimeout(timer);
  }, [regStatus]);

  // 🚀 核心逻辑：监听交易成功状态
  useEffect(() => {
    if (regStatus === "success" || renewalStatus === "success") {
      // 1. 立即执行乐观更新 (Optimistic Update)
      if (durationTarget) {
        // A. 处理续费
        if (renewalStatus === "success") {
          const labels =
            durationTarget.labels ||
            (durationTarget.record ? [durationTarget.record.label] : []);

          // 目前 UI 仅支持统一时长，取第一个即可
          const duration = durationTarget.pendingDurations
            ? durationTarget.pendingDurations[0]
            : 0n;

          if (labels.length > 0 && duration > 0n) {
            updateRenewal(labels, duration);
          }
        }

        // B. 处理注册
        if (regStatus === "success" && durationTarget.record) {
          const duration = durationTarget.pendingDurations
            ? durationTarget.pendingDurations[0]
            : 0n;
          const owner = durationTarget.pendingOwner || address;

          if (duration > 0n && owner) {
            updateRegistration(durationTarget.record.label, duration, owner);
          }
        }
      }

      // 2. 延迟执行真实刷新 (Eventual Consistency)
      // 作为双重保险，防止乐观更新计算错误
      const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["name-records"] });
        queryClient.invalidateQueries({ queryKey: ["collection-records"] });
        queryClient.invalidateQueries({ queryKey: ["account-labels"] });
      };

      const timer1 = setTimeout(refresh, 2000);
      const timer2 = setTimeout(refresh, 10000); // 10秒后再刷一次，应对 Graph 严重延迟
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [
    regStatus,
    renewalStatus,
    queryClient,
    durationTarget,
    updateRenewal,
    updateRegistration,
    address,
  ]);

  const handleSingleRegister = useCallback(
    async (record: NameRecord) => {
      resetReg();
      if (pendingLabels.has(record.label)) {
        startResuming();
        setDurationTarget({ type: "register", record });
        await checkAndResume(record.label);
      } else {
        setDurationTarget({ type: "register", record });
      }
    },
    [pendingLabels, checkAndResume, resetReg, startResuming],
  );

  const handleSingleRenew = useCallback(
    (record: NameRecord) => {
      resetRenewal();
      setDurationTarget({
        type: "renew",
        record,
        expiryTimes: [record.expiryTime],
      });
    },
    [resetRenewal],
  );

  const handleBatchRenewalTrigger = useCallback(
    (
      selectedLabels: Set<string>,
      allRecords: NameRecord[],
      onSuccess?: () => void,
    ) => {
      if (selectedLabels.size === 0) return;
      resetRenewal();

      const targetRecords = allRecords.filter((r) =>
        selectedLabels.has(r.label),
      );
      const labels = targetRecords.map((r) => r.label);
      const expiryTimes = targetRecords.map((r) => r.expiryTime);

      setDurationTarget({ type: "batch", labels, expiryTimes, onSuccess });
    },
    [resetRenewal],
  );

  const handleSetReminder = useCallback((record: NameRecord) => {
    setReminderTarget(record);
  }, []);

  const handleCloseModal = useCallback(() => {
    setDurationTarget(null);
    resetRenewal();
    resetReg();
  }, [resetRenewal, resetReg]);

  const onDurationConfirm = useCallback(
    (durations: bigint[], owner?: Address) => {
      if (!durationTarget) return;

      // 🚀 关键：将用户选择的参数保存到 state，供 useEffect 中的乐观更新使用
      setDurationTarget((prev) =>
        prev
          ? {
              ...prev,
              pendingDurations: durations,
              pendingOwner: owner,
            }
          : null,
      );

      if (durationTarget.type === "register" && durationTarget.record) {
        startRegistration(durationTarget.record.label, durations[0], owner);
      } else if (durationTarget.type === "renew" && durationTarget.record) {
        renewSingle(durationTarget.record.label, durations[0]);
      } else if (durationTarget.type === "batch" && durationTarget.labels) {
        const validItems = durationTarget.labels
          .map((label, index) => ({
            label,
            duration: durations[index],
          }))
          .filter((item) => item.duration > 0n);

        if (validItems.length === 0) {
          toast.error(t("transaction.error.all_filtered"));
          return;
        }

        const validLabels = validItems.map((i) => i.label);
        const validDurations = validItems.map((i) => i.duration);

        renewBatch(validLabels, validDurations, durationTarget.onSuccess);
      }
    },
    [durationTarget, startRegistration, renewSingle, renewBatch, t],
  );

  const getModalTitle = useCallback(() => {
    const activeType = durationTarget?.type || "renew";
    if (activeType === "register") return t("transaction.title.register");
    if (activeType === "batch")
      return t("transaction.title.batch_renew", {
        count: durationTarget?.labels?.length,
      });
    return t("transaction.title.renew");
  }, [durationTarget, t]);

  const getItemCount = useCallback(() => {
    if (!durationTarget) return 1;
    if (durationTarget.type === "batch" && durationTarget.labels) {
      return durationTarget.labels.length;
    }
    return 1;
  }, [durationTarget]);

  return {
    pendingLabels,
    isBusy:
      isRenewalBusy ||
      (regStatus !== "idle" &&
        regStatus !== "success" &&
        regStatus !== "error"),

    modalState: {
      isOpen: !!durationTarget,
      type: durationTarget?.type || "renew",
      status: durationTarget?.type === "register" ? regStatus : renewalStatus,
      txHash: durationTarget?.type === "register" ? regTxHash : renewalTxHash,
      secondsLeft,
      title: getModalTitle(),
      currentExpiry: durationTarget?.record?.expiryTime,
      reminderTarget,
      itemCount: getItemCount(),
      expiryTimes: durationTarget?.expiryTimes || [],
    },

    actions: {
      onRegister: handleSingleRegister,
      onRenew: handleSingleRenew,
      onBatchRenew: handleBatchRenewalTrigger,
      onReminder: handleSetReminder,
      onCloseModal: handleCloseModal,
      onConfirmDuration: onDurationConfirm,
      setReminderTarget,
    },
  };
};
