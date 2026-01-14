// src/pages/Account.tsx

import { useState, useMemo } from "react";
// 🚀 1. 引入路由钩子
import { useParams, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faUserTag,
  faWarehouse,
  faArrowLeft, // 🚀 2. 引入返回图标
} from "@fortawesome/free-solid-svg-icons";
import { faCopy, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import { isAddress, type Address } from "viem";
import { normalize } from "viem/ens";
import toast from "react-hot-toast";

import { truncateAddress } from "../utils/format";

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableView } from "../components/NameTable/useNameTableView";
import { FloatingBar } from "../components/FloatingBar"; // 🚀
import { ActionModals } from "../components/ActionModals"; // 🚀

// Hooks & Services
import { useNameRecords } from "../hooks/useEnsData";
import { useEnsActions } from "../hooks/useEnsActions"; // 🚀
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useOptimisticLevelUpdate } from "../hooks/useOptimisticLevelUpdate";
import { fetchLabels } from "../services/graph/fetchLabels";
import { publicClient } from "../utils/client";

// Types
import type { NameRecord } from "../types/ensNames";

// --- 内部 Hook: 解析输入为地址 ---
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

// --- 内部 Hook: 获取地址持仓 ---
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
  // --- 1. 基础 Hooks ---
  const { input } = useParams<{ input: string }>();
  const { address: myAddress, isConnected } = useAccount();
  const { t } = useTranslation();

  // --- 2. 本地状态 ---
  const [showFullAddress, setShowFullAddress] = useState(false);

  // --- 3. 数据获取 ---
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

  // --- 4. 表格视图逻辑 ---
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
    levelCounts,
    isViewStateDirty,
    resetViewState,
  } = useNameTableView(
    records,
    myAddress,
    "collection",
    resolvedAddress || "unknown",
  );

  // --- 5. 核心业务逻辑 ---
  const { pendingLabels, isBusy, modalState, actions } = useEnsActions();

  // --- 6. 辅助逻辑 ---
  const updateLevel = useOptimisticLevelUpdate();
  const handleLevelChange = (record: NameRecord, newLevel: number) => {
    updateLevel(record, newLevel);
  };

  const selectionCount = selectedLabels.size;

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

  const navigate = useNavigate();
  const handleBack = () => {
    // 判断依据：
    // location.key !== "default" 通常意味着是由路由跳转进来的（有历史）
    // window.history.state.idx > 0 也是一种判断方式
    // 这里采用更稳健的策略：如果 state.idx > 0，说明有内部历史
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1); // 返回上一页
    } else {
      navigate("/"); // 如果没有上一页（比如直接打开链接），则回首页
    }
  };

  // --- 7. 渲染 ---

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
          <p className="text-sm text-gray-400 mt-1 font-mono">{input}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto lg:px-4 py-10 pb-24 relative">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          {/* 🚀 5. 新增返回按钮 */}
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-text-main hover:bg-gray-100 transition-all active:scale-95 outline-none"
            title="返回"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
          </button>
          <h1 className="text-4xl font-qs-semibold">{t("account.title")}</h1>
          {isLoading && (
            <span className="text-sm text-link animate-pulse">
              {t("common.loading")}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center text-sm text-gray-500 bg-gray-50 border border-gray-100 p-4">
          {/* 输入名称区域 */}
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
              {/* 钱包地址区域 */}
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

              {/* 持仓总数区域 */}
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
        onRegister={actions.onRegister} // 🚀
        onRenew={actions.onRenew} // 🚀
        onReminder={actions.onReminder} // 🚀
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
        isBusy={isBusy}
        isConnected={isConnected}
        onBatchRenew={() => actions.onBatchRenew(selectedLabels)} // 🚀
        onClearSelection={clearSelection}
      />

      {/* 🚀 统一模态框 */}
      <ActionModals modalState={modalState} actions={actions} />
    </div>
  );
};
