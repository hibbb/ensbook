// src/pages/CollectionDetail.tsx

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableLogic } from "../components/NameTable/useNameTableLogic";
import { ProcessModal, type ProcessType } from "../components/ProcessModal";
import { ReminderModal } from "../components/ReminderModal";

// Hooks & Services
import { useCollectionRecords } from "../hooks/useEnsData";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { useEnsRegistration } from "../hooks/useEnsRegistration";
import { getAllPendingLabels } from "../services/storage/registration";

// Config & Utils
import { ENS_COLLECTIONS } from "../config/collections";
import { isRenewable } from "../utils/ens";
import type { NameRecord } from "../types/ensNames";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  // ==========================================================================
  // 1. 数据获取
  // ==========================================================================
  const {
    data: basicRecords,
    isLoading,
    isError,
  } = useCollectionRecords(id || "");

  // 🚀 移除全量解析: const records = usePrimaryNames(basicRecords);
  const records = basicRecords; // ✅ 直接使用基础数据

  const {
    processedRecords,
    sortConfig,
    filterConfig,
    handleSort,
    setFilterConfig,
    selectedLabels,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    statusCounts,
    actionCounts,
    nameCounts,
  } = useNameTableLogic(records, address);

  // ==========================================================================
  // 2. 区块链交互 Hooks
  // ==========================================================================

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
    checkAndResume,
    status: regStatus,
    secondsLeft,
    currentHash: regTxHash,
    resetStatus: resetReg,
  } = useEnsRegistration();

  // ==========================================================================
  // 3. 状态管理
  // ==========================================================================

  const [durationTarget, setDurationTarget] = useState<{
    type: ProcessType;
    record?: NameRecord;
    labels?: string[];
  } | null>(null);

  // 提醒功能状态
  const [reminderTarget, setReminderTarget] = useState<NameRecord | null>(null);

  const [pendingLabels, setPendingLabels] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setPendingLabels(getAllPendingLabels());
    }, 0);
    return () => clearTimeout(timer);
  }, [regStatus]);

  useEffect(() => {
    if (regStatus === "success" || renewalStatus === "success") {
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["collection-records"] });
        queryClient.invalidateQueries({ queryKey: ["name-records"] });
      }, 2000);

      const deepTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["collection-records"] });
        queryClient.invalidateQueries({ queryKey: ["name-records"] });
      }, 10000);

      return () => {
        clearTimeout(timer);
        clearTimeout(deepTimer);
      };
    }
  }, [regStatus, renewalStatus, queryClient]);

  // ==========================================================================
  // 4. 业务逻辑处理
  // ==========================================================================

  const renewableLabelSet = useMemo(() => {
    if (!processedRecords) return new Set<string>();
    return new Set(
      processedRecords.filter((r) => isRenewable(r.status)).map((r) => r.label),
    );
  }, [processedRecords]);

  const validSelection = useMemo(() => {
    if (selectedLabels.size === 0) return [];
    return Array.from(selectedLabels).filter((label) =>
      renewableLabelSet.has(label),
    );
  }, [selectedLabels, renewableLabelSet]);

  const selectionCount = validSelection.length;

  // --- 触发器 ---

  const handleSingleRegister = async (record: NameRecord) => {
    if (pendingLabels.has(record.label)) {
      setDurationTarget({ type: "register", record });
      await checkAndResume(record.label);
    } else {
      setDurationTarget({ type: "register", record });
    }
  };

  const handleSingleRenew = (record: NameRecord) => {
    setDurationTarget({ type: "renew", record });
  };

  const handleSetReminder = (record: NameRecord) => {
    setReminderTarget(record);
  };

  const handleBatchRenewalTrigger = () => {
    if (selectionCount === 0) return;
    setDurationTarget({ type: "batch", labels: validSelection });
  };

  const onDurationConfirm = (duration: bigint) => {
    if (!durationTarget) return;

    if (durationTarget.type === "register" && durationTarget.record) {
      startRegistration(durationTarget.record.label, duration);
    } else if (durationTarget.type === "renew" && durationTarget.record) {
      renewSingle(durationTarget.record.label, duration);
    } else if (durationTarget.type === "batch" && durationTarget.labels) {
      renewBatch(durationTarget.labels, duration);
    }
  };

  const handleCloseModal = () => {
    setDurationTarget(null);
    resetRenewal();
    resetReg();
  };

  const activeType = durationTarget?.type || "renew";
  const activeStatus = activeType === "register" ? regStatus : renewalStatus;
  const activeTxHash = activeType === "register" ? regTxHash : renewalTxHash;

  // ==========================================================================
  // 5. 渲染
  // ==========================================================================

  if (!collection) return <div className="p-20 text-center">集合未找到</div>;
  if (isError)
    return <div className="p-20 text-center text-red-500">加载失败</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pb-24 relative">
      <header className="mb-10">
        <h1 className="text-4xl font-qs-semibold">{collection.displayName}</h1>
        <p className="text-gray-400 mt-2">{collection.description}</p>
      </header>
      <NameTable
        records={processedRecords}
        isLoading={isLoading}
        currentAddress={address}
        isConnected={isConnected}
        sortConfig={sortConfig}
        onSort={handleSort}
        filterConfig={filterConfig}
        onFilterChange={setFilterConfig}
        canDelete={false}
        selectedLabels={selectedLabels}
        onToggleSelection={toggleSelection}
        onToggleSelectAll={toggleSelectAll}
        onRegister={handleSingleRegister}
        onRenew={handleSingleRenew}
        onReminder={handleSetReminder}
        pendingLabels={pendingLabels}
        totalRecordsCount={records?.length || 0}
        statusCounts={statusCounts}
        actionCounts={actionCounts}
        nameCounts={nameCounts}
      />
      {/* 底部悬浮操作栏 */}
      {selectionCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-qs-medium text-text-main">
              已选择{" "}
              <span className="text-link font-bold">{selectionCount}</span>{" "}
              个域名
            </span>

            <div className="h-4 w-px bg-gray-300 mx-1" />

            <button
              onClick={handleBatchRenewalTrigger}
              disabled={isRenewalBusy || !isConnected}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-qs-semibold transition-all shadow-sm ${
                isRenewalBusy || !isConnected
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-link text-white hover:bg-link-hover hover:shadow-md active:scale-95"
              }`}
            >
              <FontAwesomeIcon icon={faRotate} spin={isRenewalBusy} />
              批量续费
            </button>

            <button
              onClick={clearSelection}
              className="ml-2 text-xs text-gray-400 hover:text-text-main underline decoration-gray-300 underline-offset-2"
            >
              取消
            </button>
          </div>
        </div>
      )}
      {/* 流程模态框 */}
      <ProcessModal
        isOpen={!!durationTarget}
        type={activeType}
        status={activeStatus}
        txHash={activeTxHash}
        secondsLeft={secondsLeft}
        title={
          activeType === "register"
            ? "设置注册时长"
            : activeType === "batch"
              ? `批量续费 (${durationTarget?.labels?.length}个)`
              : "设置续费时长"
        }
        onClose={handleCloseModal}
        onConfirm={onDurationConfirm}
      />
      {/* 🚀 5. 渲染提醒模态框 */}
      <ReminderModal
        isOpen={!!reminderTarget}
        onClose={() => setReminderTarget(null)}
        record={reminderTarget}
      />
    </div>
  );
};
