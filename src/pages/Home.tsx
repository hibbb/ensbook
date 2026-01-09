// src/pages/Home.tsx

import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableView } from "../components/NameTable/useNameTableView";
import { SearchHelpModal } from "../components/SearchHelpModal";
import { ProcessModal, type ProcessType } from "../components/ProcessModal";
import { ReminderModal } from "../components/ReminderModal";
import { HomeSearchSection } from "./Home/HomeSearchSection";
import { HomeFloatingBar } from "./Home/HomeFloatingBar";

// Hooks & Services
import { useNameRecords } from "../hooks/useEnsData";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { useEnsRegistration } from "../hooks/useEnsRegistration";
import { parseAndClassifyInputs } from "../utils/parseInputs";
import { fetchLabels } from "../services/graph/fetchLabels";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useOptimisticLevelUpdate } from "../hooks/useOptimisticLevelUpdate";

import {
  getHomeLabels,
  bulkAddToHome,
  removeFromHome,
  bulkRemoveFromHome,
  clearHomeList,
} from "../services/storage/userStore";

import { getAllPendingLabels } from "../services/storage/registration";

// Types
import type { NameRecord } from "../types/ensNames";
import type { DeleteCriteria } from "../components/NameTable/types";

export const Home = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  useDocumentTitle("Home");

  const [resolvedLabels, setResolvedLabels] = useState<string[]>(() =>
    getHomeLabels(),
  );
  const [inputValue, setInputValue] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [durationTarget, setDurationTarget] = useState<{
    type: ProcessType;
    record?: NameRecord;
    labels?: string[];
  } | null>(null);
  const [reminderTarget, setReminderTarget] = useState<NameRecord | null>(null);

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["name-records"] });
  }, [queryClient]);

  const { data: records, isLoading: isQuerying } =
    useNameRecords(resolvedLabels);

  const showSkeleton = isQuerying || isResolving;

  const validRecords = useMemo(() => {
    if (!records || resolvedLabels.length === 0) return [];
    const currentLabelSet = new Set(resolvedLabels);
    return records.filter((r) => currentLabelSet.has(r.label));
  }, [records, resolvedLabels]);

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
  } = useNameTableView(validRecords, address, "home");

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

  const [pendingLabels, setPendingLabels] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPendingLabels(getAllPendingLabels());
  }, [resolvedLabels, regStatus]);

  const hasContent = resolvedLabels.length > 0;

  useEffect(() => {
    if (!hasContent && isViewStateDirty) {
      resetViewState();
    }
  }, [hasContent, isViewStateDirty, resetViewState]);

  const updateLevel = useOptimisticLevelUpdate();

  const handleLevelChange = (record: NameRecord, newLevel: number) => {
    updateLevel(record, newLevel);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setIsResolving(true);
    try {
      const classified = parseAndClassifyInputs(inputValue);
      const fetchedLabels = await fetchLabels(classified);

      if (fetchedLabels.length > 0) {
        const currentSet = new Set(resolvedLabels);
        const newUniqueLabels = fetchedLabels.filter((l) => !currentSet.has(l));

        if (newUniqueLabels.length === 0) {
          toast(t("home.toast.all_exist"), { icon: "👌" });
        } else {
          bulkAddToHome(newUniqueLabels);
          setResolvedLabels(getHomeLabels());
          toast.success(
            t("home.toast.add_success", { count: newUniqueLabels.length }),
          );
          setInputValue("");
        }
      } else {
        toast(t("home.toast.no_valid"), { icon: "🤔" });
      }
    } catch (error) {
      console.error("解析失败:", error);
      toast.error(t("home.toast.parse_error"));
    } finally {
      setIsResolving(false);
    }
  };

  const handleDelete = (record: NameRecord) => {
    removeFromHome(record.label);
    setResolvedLabels((prev) => prev.filter((l) => l !== record.label));
    if (selectedLabels.has(record.label)) {
      toggleSelection(record.label);
    }
  };

  const handleBatchDelete = (criteria: DeleteCriteria) => {
    const targetRecords = records;
    if (!targetRecords) return;

    const { type, value } = criteria;

    if (type === "all") {
      if (window.confirm(t("home.toast.clear_confirm"))) {
        clearHomeList();
        setResolvedLabels([]);
        clearSelection();
      }
      return;
    }

    let labelsToDelete = new Set<string>();

    switch (type) {
      case "status":
        labelsToDelete = new Set(
          targetRecords.filter((r) => r.status === value).map((r) => r.label),
        );
        break;
      case "length":
        labelsToDelete = new Set(
          targetRecords
            .filter((r) => r.label.length === value)
            .map((r) => r.label),
        );
        break;
      case "wrapped": {
        const isWrapped = value as boolean;
        labelsToDelete = new Set(
          targetRecords
            .filter((r) => r.wrapped === isWrapped)
            .map((r) => r.label),
        );
        break;
      }
      case "owner": {
        if (!address) {
          toast.error(t("common.connect_wallet")); // 🚀 复用 common
          return;
        }
        const isDeletingMine = value === "mine";
        labelsToDelete = new Set(
          targetRecords
            .filter((r) => {
              const recordOwner = r.owner?.toLowerCase();
              const myAddress = address.toLowerCase();
              const isOwner = recordOwner === myAddress;
              return isDeletingMine ? isOwner : !isOwner;
            })
            .map((r) => r.label),
        );
        break;
      }
    }

    if (labelsToDelete.size === 0) return;

    bulkRemoveFromHome(Array.from(labelsToDelete));
    setResolvedLabels((prev) =>
      prev.filter((label) => !labelsToDelete.has(label)),
    );

    if (selectedLabels.size > 0) {
      labelsToDelete.forEach((label) => {
        if (selectedLabels.has(label)) {
          toggleSelection(label);
        }
      });
    }
    toast.success(t("home.toast.delete_success"));
  };

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
    if (selectedLabels.size === 0) return;
    setDurationTarget({ type: "batch", labels: Array.from(selectedLabels) });
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

  return (
    <div className="max-w-7xl mx-auto px-4 relative min-h-[85vh] flex flex-col">
      <HomeSearchSection
        hasContent={hasContent}
        inputValue={inputValue}
        isResolving={isResolving}
        onInputChange={setInputValue}
        onSubmit={() => handleSubmit()}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {hasContent && (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards pb-20">
          <NameTable
            records={processedRecords}
            isLoading={showSkeleton}
            currentAddress={address}
            isConnected={isConnected}
            sortConfig={sortConfig}
            onSort={handleSort}
            filterConfig={filterConfig}
            onFilterChange={setFilterConfig}
            canDelete={true}
            onDelete={handleDelete}
            onBatchDelete={handleBatchDelete}
            selectedLabels={selectedLabels}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={toggleSelectAll}
            pendingLabels={pendingLabels}
            onRegister={handleSingleRegister}
            onRenew={handleSingleRenew}
            onReminder={handleSetReminder}
            skeletonRows={5}
            headerTop="88px"
            totalRecordsCount={validRecords?.length || 0}
            statusCounts={statusCounts}
            actionCounts={actionCounts}
            nameCounts={nameCounts}
            levelCounts={levelCounts}
            isViewStateDirty={isViewStateDirty}
            onResetViewState={resetViewState}
            onLevelChange={handleLevelChange}
          />
        </div>
      )}

      <HomeFloatingBar
        selectedCount={selectedLabels.size}
        isBusy={isRenewalBusy}
        isConnected={isConnected}
        onBatchRenew={handleBatchRenewalTrigger}
        onClearSelection={clearSelection}
      />

      <SearchHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
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
      />

      <ReminderModal
        isOpen={!!reminderTarget}
        onClose={() => setReminderTarget(null)}
        record={reminderTarget}
      />
    </div>
  );
};
