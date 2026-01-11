// src/pages/Mine.tsx

import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFeatherPointed } from "@fortawesome/free-solid-svg-icons";
import { useTranslation, Trans } from "react-i18next";

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableView } from "../components/NameTable/useNameTableView";
import { ProcessModal, type ProcessType } from "../components/ProcessModal";
import { ReminderModal } from "../components/ReminderModal";
// 🚀 引入通用组件
import { FloatingBar } from "../components/FloatingBar";

// Hooks & Services
import { useNameRecords } from "../hooks/useEnsData";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { useEnsRegistration } from "../hooks/useEnsRegistration";
import { getAllPendingLabels } from "../services/storage/registration";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useMyCollectionSource } from "../hooks/useMyCollectionSource";
import { parseAndClassifyInputs } from "../utils/parseInputs";
import { fetchLabels } from "../services/graph/fetchLabels";
import { isRenewable } from "../utils/ens";
import { useOptimisticLevelUpdate } from "../hooks/useOptimisticLevelUpdate";

// Types
import type { NameRecord } from "../types/ensNames";

const useMyCollectionLabels = (source: string) => {
  return useQuery({
    queryKey: ["my-collection-labels", source],
    queryFn: async () => {
      if (!source) return [];
      const classified = parseAndClassifyInputs(source);
      return await fetchLabels(classified);
    },
    enabled: !!source,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const Mine = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const source = useMyCollectionSource();
  const hasSource = !!source && source.length > 0;

  useDocumentTitle("Mine");

  const {
    data: labels,
    isLoading: isResolving,
    isError: isResolveError,
  } = useMyCollectionLabels(source);

  const labelsToQuery = isResolving ? [] : labels || [];

  const {
    data: records,
    isLoading: isQuerying,
    isError: isQueryError,
  } = useNameRecords(labelsToQuery);

  const isLoading = isResolving || isQuerying;
  const isError = isResolveError || isQueryError;

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
  } = useNameTableView(records, address, "collection", "mine");

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
        queryClient.invalidateQueries({ queryKey: ["name-records"] });
      }, 2000);
      const deepTimer = setTimeout(() => {
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

  // --- Render Logic ---

  if (!hasSource) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
          <FontAwesomeIcon icon={faFeatherPointed} size="2x" />
        </div>
        <h2 className="text-2xl font-qs-semibold text-gray-800 mb-3">
          {t("mine.empty_state.title")}
        </h2>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
          <Trans i18nKey="mine.empty_state.desc">
            Mine 页面允许你通过自定义规则
            <br />
            （如 "abc, hello, 12345"、"@vitalik.eth" 或以太坊地址）
            <br />
            来创建一个专属的域名集合。
          </Trans>
        </p>
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-400 mb-8 font-mono">
          <Trans i18nKey="mine.empty_state.guide">
            请前往 <span className="text-text-main">设置 {">"} 我的集合</span>{" "}
            进行配置
          </Trans>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-20 text-center text-red-500">{t("mine.error")}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pb-24 relative">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-qs-semibold flex items-center gap-3">
            {t("mine.title")}
            <span className="text-sm bg-black text-white px-2 py-1 rounded-md font-bold tracking-wide transform -translate-y-4">
              {t("mine.subtitle")}
            </span>
          </h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faFeatherPointed} className="text-xs" />
            <span>{t("mine.custom_collection")}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
            <span className="font-mono text-xs opacity-70 truncate max-w-[300px]">
              {source}
            </span>
          </p>
        </div>
      </header>

      <NameTable
        key="mine-table"
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

      {/* 🚀 使用通用 FloatingBar */}
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
