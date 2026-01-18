// src/hooks/useEnsActions.ts

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useEnsRenewal } from "./useEnsRenewal";
import { useEnsRegistration } from "./useEnsRegistration";
import { getAllPendingLabels } from "../services/storage/registration";

import type { NameRecord } from "../types/ensNames";
import type { ProcessType } from "../components/ProcessModal";

// 🚀 移除 address 参数，因为子 Hook 会自动获取当前账户
export const useEnsActions = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // --- 1. 本地状态管理 ---
  const [durationTarget, setDurationTarget] = useState<{
    type: ProcessType;
    record?: NameRecord;
    labels?: string[];
  } | null>(null);

  const [reminderTarget, setReminderTarget] = useState<NameRecord | null>(null);
  const [pendingLabels, setPendingLabels] = useState<Set<string>>(new Set());

  // --- 2. 引入核心业务 Hooks ---
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

  // --- 3. 副作用：同步 Pending 状态 ---
  useEffect(() => {
    // 使用 setTimeout 避免在渲染期间直接更新状态
    const timer = setTimeout(() => {
      setPendingLabels(getAllPendingLabels());
    }, 0);
    return () => clearTimeout(timer);
  }, [regStatus]);

  // --- 4. 副作用：交易成功后刷新数据 ---
  useEffect(() => {
    if (regStatus === "success" || renewalStatus === "success") {
      const refresh = () => {
        // 模糊匹配刷新所有相关列表
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

  // --- 5. 事件处理函数 ---

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
    setDurationTarget({ type: "renew", record });
  }, []);

  // 🚀 移除未使用的 records 参数
  const handleBatchRenewalTrigger = useCallback(
    (selectedLabels: Set<string>) => {
      if (selectedLabels.size === 0) return;
      const labels = Array.from(selectedLabels);
      setDurationTarget({ type: "batch", labels });
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

  // 🚀 核心修改：接收数组参数
  const onDurationConfirm = useCallback(
    (durations: bigint[]) => {
      if (!durationTarget) return;

      if (durationTarget.type === "register" && durationTarget.record) {
        // 注册只支持单个，取第一个时长
        startRegistration(durationTarget.record.label, durations[0]);
      } else if (durationTarget.type === "renew" && durationTarget.record) {
        // 单个续费，取第一个时长
        renewSingle(durationTarget.record.label, durations[0]);
      } else if (durationTarget.type === "batch" && durationTarget.labels) {
        // 批量续费，直接传递数组 (useEnsRenewal 已更新为接收数组)
        renewBatch(durationTarget.labels, durations);
      }
    },
    [durationTarget, startRegistration, renewSingle, renewBatch],
  );

  // --- 6. 计算 Modal 标题 ---
  const getModalTitle = useCallback(() => {
    const activeType = durationTarget?.type || "renew";
    if (activeType === "register") return t("transaction.title.register");
    if (activeType === "batch")
      return t("transaction.title.batch_renew", {
        count: durationTarget?.labels?.length,
      });
    return t("transaction.title.renew");
  }, [durationTarget, t]);

  // 🚀 新增：计算当前操作的项目数量
  const getItemCount = useCallback(() => {
    if (!durationTarget) return 1;
    if (durationTarget.type === "batch" && durationTarget.labels) {
      return durationTarget.labels.length;
    }
    return 1;
  }, [durationTarget]);

  // --- 7. 导出 ---
  return {
    // 状态
    pendingLabels,
    isBusy:
      isRenewalBusy ||
      (regStatus !== "idle" &&
        regStatus !== "success" &&
        regStatus !== "error"),

    // Modal 需要的数据
    modalState: {
      isOpen: !!durationTarget,
      type: durationTarget?.type || "renew",
      status: durationTarget?.type === "register" ? regStatus : renewalStatus,
      txHash: durationTarget?.type === "register" ? regTxHash : renewalTxHash,
      secondsLeft,
      title: getModalTitle(),
      currentExpiry: durationTarget?.record?.expiryTime,
      reminderTarget,
      // 🚀 传递数量给 UI
      itemCount: getItemCount(),
    },

    // 操作方法
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
