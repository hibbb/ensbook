// src/pages/CollectionDetail.tsx

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
// 🗑️ 移除不再需要的图标引用 (faRotate 等已在 FloatingBar 内部处理)
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableView } from "../components/NameTable/useNameTableView";
import { ProcessModal, type ProcessType } from "../components/ProcessModal";
import { ReminderModal } from "../components/ReminderModal";
// 🚀 1. 引入通用组件
import { FloatingBar } from "../components/FloatingBar";

// Hooks & Services
import { useCollectionRecords } from "../hooks/useEnsData";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { useEnsRegistration } from "../hooks/useEnsRegistration";
import { getAllPendingLabels } from "../services/storage/registration";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useOptimisticLevelUpdate } from "../hooks/useOptimisticLevelUpdate";

// Config & Utils
import { ENS_COLLECTIONS } from "../config/collections";
import { isRenewable } from "../utils/ens";
import type { NameRecord } from "../types/ensNames";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  useDocumentTitle(collection ? t(collection.displayName) : undefined);

  const { data: records, isLoading, isError } = useCollectionRecords(id || "");

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
    isViewStateDirty,
    resetViewState,
    levelCounts,
  } = useNameTableView(records, address, "collection", id);

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

  const [durationTarget, setDurationTarget] = useState<{
    type: ProcessType;
    record?: NameRecord;
    labels?: string[];
  } | null>(null);

  const [reminderTarget, setReminderTarget] = useState<NameRecord | null>(null);
  const [pendingLabels, setPendingLabels] = useState<Set<string>>(new Set());

  const updateLevel = useOptimisticLevelUpdate();

  const handleLevelChange = (record: NameRecord, newLevel: number) => {
    updateLevel(record, newLevel);
  };

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

  const handleSingleRegister = async (record: NameRecord) => {
    if (pendingLabels.has(record.label)) {
      setDurationTarget({ type: "register", record });
      await checkAndResume(record.label);
    } else {
      setDurationTarget({ type: "register", record });
    }
  };
  const handleSingleRenew = (r: NameRecord) =>
    setDurationTarget({ type: "renew", record: r });
  const handleSetReminder = (r: NameRecord) => setReminderTarget(r);
  const handleBatchRenewalTrigger = () => {
    if (selectionCount > 0)
      setDurationTarget({ type: "batch", labels: validSelection });
  };
  const handleCloseModal = () => {
    setDurationTarget(null);
    resetRenewal();
    resetReg();
  };
  const onDurationConfirm = (d: bigint) => {
    if (!durationTarget) return;
    if (durationTarget.type === "register" && durationTarget.record)
      startRegistration(durationTarget.record.label, d);
    else if (durationTarget.type === "renew" && durationTarget.record)
      renewSingle(durationTarget.record.label, d);
    else if (durationTarget.type === "batch" && durationTarget.labels)
      renewBatch(durationTarget.labels, d);
  };

  const activeType = durationTarget?.type || "renew";
  const activeStatus = activeType === "register" ? regStatus : renewalStatus;
  const activeTxHash = activeType === "register" ? regTxHash : renewalTxHash;

  const getModalTitle = () => {
    if (activeType === "register") return t("transaction.title.register");
    if (activeType === "batch")
      return t("transaction.title.batch_renew", {
        count: durationTarget?.labels?.length,
      });
    return t("transaction.title.renew");
  };

  const currentExpiry = durationTarget?.record?.expiryTime;

  if (!collection)
    return <div className="p-20 text-center">{t("collection.not_found")}</div>;
  if (isError)
    return (
      <div className="p-20 text-center text-red-500">
        {t("collection.load_fail")}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pb-24 relative">
      <header className="mb-10">
        <h1 className="text-4xl font-qs-semibold">
          {t(collection.displayName)}
        </h1>
        <p className="text-gray-400 mt-2">{t(collection.description)}</p>
      </header>

      <NameTable
        key={id}
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
        levelCounts={levelCounts}
        isViewStateDirty={isViewStateDirty}
        onResetViewState={resetViewState}
        onLevelChange={handleLevelChange}
      />

      {/* 🚀 2. 替换为通用组件 */}
      <FloatingBar
        selectedCount={selectionCount}
        isBusy={isRenewalBusy}
        isConnected={isConnected}
        onBatchRenew={handleBatchRenewalTrigger}
        onClearSelection={clearSelection}
      />

      <ProcessModal
        isOpen={!!durationTarget}
        type={activeType}
        status={activeStatus}
        txHash={activeTxHash}
        secondsLeft={secondsLeft}
        title={getModalTitle()}
        onClose={handleCloseModal}
        onConfirm={onDurationConfirm}
        currentExpiry={currentExpiry}
      />
      <ReminderModal
        isOpen={!!reminderTarget}
        onClose={() => setReminderTarget(null)}
        record={reminderTarget}
      />
    </div>
  );
};
