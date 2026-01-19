// src/hooks/useEnsActions.ts

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast"; // 🚀 引入 toast

import { useEnsRenewal } from "./useEnsRenewal";
import { useEnsRegistration } from "./useEnsRegistration";
import { getAllPendingLabels } from "../services/storage/registration";

import type { NameRecord } from "../types/ensNames";
import type { ProcessType } from "../components/ProcessModal";

export const useEnsActions = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // ... (状态定义保持不变) ...
  const [durationTarget, setDurationTarget] = useState<{
    type: ProcessType;
    record?: NameRecord;
    labels?: string[];
    expiryTimes?: number[];
  } | null>(null);

  const [reminderTarget, setReminderTarget] = useState<NameRecord | null>(null);
  const [pendingLabels, setPendingLabels] = useState<Set<string>>(new Set());

  // ... (useEnsRenewal, useEnsRegistration, useEffects 保持不变) ...
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
  } = useEnsRegistration();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPendingLabels(getAllPendingLabels());
    }, 0);
    return () => clearTimeout(timer);
  }, [regStatus]);

  useEffect(() => {
    if (regStatus === "success" || renewalStatus === "success") {
      const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["name-records"] });
        queryClient.invalidateQueries({ queryKey: ["collection-records"] });
        queryClient.invalidateQueries({ queryKey: ["account-labels"] });
      };
      const timer1 = setTimeout(refresh, 2000);
      const timer2 = setTimeout(refresh, 10000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [regStatus, renewalStatus, queryClient]);

  // ... (handleSingleRegister, handleSingleRenew, handleBatchRenewalTrigger 等保持不变) ...
  const handleSingleRegister = useCallback(
    async (record: NameRecord) => {
      if (pendingLabels.has(record.label)) {
        setDurationTarget({ type: "register", record });
        await checkAndResume(record.label);
      } else {
        setDurationTarget({ type: "register", record });
      }
    },
    [pendingLabels, checkAndResume],
  );

  const handleSingleRenew = useCallback((record: NameRecord) => {
    setDurationTarget({
      type: "renew",
      record,
      expiryTimes: [record.expiryTime],
    });
  }, []);

  const handleBatchRenewalTrigger = useCallback(
    (selectedLabels: Set<string>, allRecords: NameRecord[]) => {
      if (selectedLabels.size === 0) return;

      const targetRecords = allRecords.filter((r) =>
        selectedLabels.has(r.label),
      );
      const labels = targetRecords.map((r) => r.label);
      const expiryTimes = targetRecords.map((r) => r.expiryTime);

      setDurationTarget({ type: "batch", labels, expiryTimes });
    },
    [],
  );

  const handleSetReminder = useCallback((record: NameRecord) => {
    setReminderTarget(record);
  }, []);

  const handleCloseModal = useCallback(() => {
    setDurationTarget(null);
    resetRenewal();
    resetReg();
  }, [resetRenewal, resetReg]);

  // 🚀 核心修改：过滤无效时长
  const onDurationConfirm = useCallback(
    (durations: bigint[]) => {
      if (!durationTarget) return;

      if (durationTarget.type === "register" && durationTarget.record) {
        startRegistration(durationTarget.record.label, durations[0]);
      } else if (durationTarget.type === "renew" && durationTarget.record) {
        renewSingle(durationTarget.record.label, durations[0]);
      } else if (durationTarget.type === "batch" && durationTarget.labels) {
        // 🚀 过滤逻辑：
        // 1. 组合 label 和 duration
        // 2. 剔除 duration <= 0 的项
        // 3. 拆分回两个数组

        const validItems = durationTarget.labels
          .map((label, index) => ({
            label,
            duration: durations[index],
          }))
          .filter((item) => item.duration > 0n);

        if (validItems.length === 0) {
          // 如果全部被过滤掉了（说明所有选中的域名都已经晚于目标日期）
          toast.error(t("transaction.error.all_filtered")); // 需要在语言包添加
          return;
        }

        const validLabels = validItems.map((i) => i.label);
        const validDurations = validItems.map((i) => i.duration);

        renewBatch(validLabels, validDurations);
      }
    },
    [durationTarget, startRegistration, renewSingle, renewBatch, t],
  );

  // ... (getModalTitle, getItemCount 保持不变) ...
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
