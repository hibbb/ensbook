// src/pages/Account.tsx

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faUserTag,
  faWarehouse, // 🚀 1. 引入新图标
} from "@fortawesome/free-solid-svg-icons";
import { faCopy, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import { isAddress, type Address } from "viem";
import { normalize } from "viem/ens";
import toast from "react-hot-toast";

import { truncateAddress } from "../utils/format";

// ... (Components imports 保持不变)
import { NameTable } from "../components/NameTable";
import { useNameTableView } from "../components/NameTable/useNameTableView";
import { ProcessModal, type ProcessType } from "../components/ProcessModal";
import { ReminderModal } from "../components/ReminderModal";
import { FloatingBar } from "../components/FloatingBar";

// ... (Hooks & Services imports 保持不变)
import { useNameRecords } from "../hooks/useEnsData";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { useEnsRegistration } from "../hooks/useEnsRegistration";
import { getAllPendingLabels } from "../services/storage/registration";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useOptimisticLevelUpdate } from "../hooks/useOptimisticLevelUpdate";
import { fetchLabels } from "../services/graph/fetchLabels";
import { publicClient } from "../utils/client";
import { isRenewable } from "../utils/ens";

// ... (Types imports 保持不变)
import type { NameRecord } from "../types/ensNames";

// ... (useResolveInput 和 useAccountLabels Hooks 保持不变) ...
const useResolveInput = (input: string | undefined) => {
  return useQuery({
    queryKey: ["resolve-account", input],
    queryFn: async (): Promise<Address | null> => {
      if (!input) return null;
      if (isAddress(input)) return input;

      let nameToResolve = input;
      if (!input.includes(".")) {
        nameToResolve = `${input}.eth`;
      }

      try {
        const normalizedName = normalize(nameToResolve);
        const address = await publicClient.getEnsAddress({
          name: normalizedName,
        });
        return address;
      } catch (error) {
        console.error("Name resolution failed:", error);
        return null;
      }
    },
    enabled: !!input,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
};

const useAccountLabels = (address: Address | null | undefined) => {
  return useQuery({
    queryKey: ["account-labels", address],
    queryFn: async () => {
      if (!address) return [];
      return await fetchLabels({
        sameOwners: [],
        pureLabels: [],
        ethAddresses: [address],
      });
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 5,
  });
};

export const Account = () => {
  const { input } = useParams<{ input: string }>();
  const { address: myAddress, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [showFullAddress, setShowFullAddress] = useState(false);

  const {
    data: resolvedAddress,
    isLoading: isResolving,
    isError: isResolveError,
  } = useResolveInput(input);

  useDocumentTitle(`Account: ${input}`);

  const {
    data: labels,
    isLoading: isFetchingLabels,
    isError: isFetchError,
  } = useAccountLabels(resolvedAddress);

  const labelsToQuery = labels || [];

  const { data: records, isLoading: isQueryingRecords } =
    useNameRecords(labelsToQuery);

  const isLoading = isResolving || isFetchingLabels || isQueryingRecords;
  const isError =
    isResolveError ||
    isFetchError ||
    (resolvedAddress === null && !isResolving);

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
  } = useNameTableView(
    records,
    myAddress,
    "collection",
    resolvedAddress || "unknown",
  );

  // ... (交易相关 Hooks 保持不变) ...
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
        queryClient.invalidateQueries({ queryKey: ["account-labels"] });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [regStatus, renewalStatus, queryClient]);

  // ... (批量操作逻辑保持不变) ...
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("common.copy_success", { label }));
  };

  const { displayName, fullNameToCopy } = useMemo(() => {
    if (!input) return { displayName: "", fullNameToCopy: "" };
    if (isAddress(input)) {
      return {
        displayName: truncateAddress(input),
        fullNameToCopy: input,
      };
    }
    const full = input.includes(".") ? input : `${input}.eth`;
    return {
      displayName: full,
      fullNameToCopy: full,
    };
  }, [input]);

  if (isError) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4 animate-in fade-in">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400">
          <FontAwesomeIcon icon={faUserTag} size="2x" />
        </div>
        <div>
          <h2 className="text-lg font-qs-semibold text-gray-800">
            {t("account.error_resolve")}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{input}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pb-24 relative">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-qs-semibold">{t("account.title")}</h1>
          {isLoading && (
            <span className="text-sm text-link animate-pulse">
              {t("common.loading")}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center text-sm text-gray-500 bg-gray-50 border border-gray-100 p-4 rounded-xl">
          {/* 1. 输入名称区域 */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUserTag} className="text-gray-400" />
            <span className="font-qs-regular text-gray-500">
              {t("account.name_label")}:
            </span>
            <span className="font-qs-medium text-text-main">{displayName}</span>
            <button
              onClick={() => handleCopy(fullNameToCopy, "Name")}
              className="text-gray-400 hover:text-link transition-colors p-1"
              title="Copy Name"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>

          {resolvedAddress && (
            <>
              <div className="hidden md:block w-px h-4 bg-gray-300"></div>
              {/* 2. 钱包地址区域 */}
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faWallet} className="text-gray-400" />
                <span className="font-qs-regular text-gray-500">
                  {t("account.address_label")}:
                </span>
                <span className="text-text-main">
                  {showFullAddress
                    ? resolvedAddress
                    : truncateAddress(resolvedAddress)}
                </span>
                <button
                  onClick={() => setShowFullAddress(!showFullAddress)}
                  className="text-gray-400 hover:text-link transition-colors p-1"
                  title={showFullAddress ? "Collapse" : "Expand"}
                >
                  <FontAwesomeIcon
                    icon={showFullAddress ? faEyeSlash : faEye}
                  />
                </button>
                <button
                  onClick={() => handleCopy(resolvedAddress, "Address")}
                  className="text-gray-400 hover:text-link transition-colors p-1"
                  title="Copy Address"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>

              {/* 🚀 3. 新增：持仓总数区域 */}
              <div className="hidden md:block w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faWarehouse} className="text-gray-400" />
                <span className="font-qs-regular text-gray-500">
                  {t("account.total_label")}:
                </span>
                <span className="font-qs-medium text-text-main">
                  {labels?.length || 0}
                </span>
              </div>
            </>
          )}
        </div>
      </header>

      <NameTable
        key={resolvedAddress || "loading"}
        records={processedRecords}
        isLoading={isLoading}
        currentAddress={myAddress}
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
      />
      <ReminderModal
        isOpen={!!reminderTarget}
        onClose={() => setReminderTarget(null)}
        record={reminderTarget}
      />
    </div>
  );
};
