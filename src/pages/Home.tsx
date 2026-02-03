// src/pages/Home.tsx

import { useState, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { namehash, labelhash } from "viem"; // 🚀 引入 viem

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableView } from "../components/NameTable/useNameTableView";
import { SearchHelpModal } from "../components/SearchHelpModal";
import { HomeSearchSection } from "./Home/HomeSearchSection";
import { FloatingBar } from "../components/FloatingBar";
import { ActionModals } from "../components/ActionModals";

// Hooks & Services
import { useNameRecords } from "../hooks/useEnsData";
import { useEnsActions } from "../hooks/useEnsActions";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useOptimisticLevelUpdate } from "../hooks/useOptimisticLevelUpdate";
import { parseAndClassifyInputs } from "../utils/parseInputs";
import { fetchLabels } from "../services/graph/fetchLabels";
import {
  getHomeLabels,
  bulkAddToHome,
  removeFromHome,
  bulkRemoveFromHome,
  clearHomeList,
} from "../services/storage/userStore";

// Types
import type { NameRecord } from "../types/ensNames";
import type { DeleteCriteria } from "../components/NameTable/types";

export const Home = () => {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  useDocumentTitle("Home");

  const [resolvedLabels, setResolvedLabels] = useState<string[]>(() =>
    getHomeLabels(),
  );
  const [inputValue, setInputValue] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // 1. 获取远程数据 (可能正在加载，或者包含旧数据)
  const { data: fetchedRecords } = useNameRecords(resolvedLabels);

  // 🚀 2. 核心修改：构建混合数据源 (Merged Records)
  // 以本地 resolvedLabels 为准，立即渲染所有行
  const mergedRecords = useMemo(() => {
    // 将远程数据转为 Map 以便快速查找
    const recordMap = new Map(fetchedRecords?.map((r) => [r.label, r]));

    return resolvedLabels.map((label) => {
      // A. 尝试获取远程数据
      const remoteRecord = recordMap.get(label);
      if (remoteRecord) return remoteRecord;

      // B. 如果没拿到 (正在加载中)，生成一个“占位记录”
      // 这样用户能立刻看到这一行，虽然状态暂时是 Unknown
      return {
        label: label,
        namehash: namehash(`${label}.eth`),
        labelhash: labelhash(label),
        length: label.length,
        status: "Unknown", // 稍后会自动更新为真实状态
        owner: null,
        wrapped: false,
        registeredTime: 0,
        expiryTime: 0,
        releaseTime: 0,
        level: 0, // 默认等级
        memo: "", // 暂时为空
      } as NameRecord;
    });
  }, [resolvedLabels, fetchedRecords]);

  // 🚀 3. 骨架屏逻辑调整：
  // 只有在“解析输入中”才显示骨架屏。
  // “查询链上数据中”不再显示骨架屏，而是显示上面的占位记录。
  const showSkeleton = isResolving;
  const hasContent = resolvedLabels.length > 0;

  // 4. 将混合后的数据传给 useNameTableView
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
    ownerCounts,
    ownerStats,
    ownershipCounts,
  } = useNameTableView(mergedRecords, address, "home");

  const { pendingLabels, isBusy, modalState, actions } = useEnsActions();

  const updateLevel = useOptimisticLevelUpdate();

  const handleLevelChange = useCallback(
    (record: NameRecord, newLevel: number) => {
      updateLevel(record, newLevel);
    },
    [updateLevel],
  );

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

  const handleDelete = useCallback(
    (record: NameRecord) => {
      removeFromHome(record.label);
      setResolvedLabels((prev) => prev.filter((l) => l !== record.label));
      if (selectedLabels.has(record.label)) {
        toggleSelection(record.label);
      }
    },
    [selectedLabels, toggleSelection],
  );

  const handleBatchDelete = useCallback(
    (criteria: DeleteCriteria) => {
      // 注意：这里使用 mergedRecords 而不是 records，确保数据源一致
      const targetRecords = mergedRecords;
      if (!targetRecords) return;

      const { type, value } = criteria;

      if (type === "all") {
        if (window.confirm(t("home.toast.clear_confirm"))) {
          clearHomeList();
          setResolvedLabels([]);
          clearSelection();
          resetViewState();
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
            toast.error(t("common.connect_wallet"));
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
    },
    [
      mergedRecords, // 🚀 依赖更新
      address,
      selectedLabels,
      toggleSelection,
      resetViewState,
      clearSelection,
      t,
    ],
  );

  return (
    <div className="max-w-7xl mx-auto lg:px-4 relative min-h-[85vh] flex flex-col">
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
            onRegister={actions.onRegister}
            onRenew={actions.onRenew}
            onReminder={actions.onReminder}
            skeletonRows={5}
            headerTop="88px"
            totalRecordsCount={mergedRecords?.length || 0} // 🚀 使用 mergedRecords
            statusCounts={statusCounts}
            actionCounts={actionCounts}
            nameCounts={nameCounts}
            levelCounts={levelCounts}
            isViewStateDirty={isViewStateDirty}
            onResetViewState={resetViewState}
            onLevelChange={handleLevelChange}
            ownerCounts={ownerCounts}
            ownerStats={ownerStats}
            ownershipCounts={ownershipCounts}
          />
        </div>
      )}

      <FloatingBar
        selectedCount={selectedLabels.size}
        isBusy={isBusy}
        isConnected={isConnected}
        onBatchRenew={() =>
          actions.onBatchRenew(
            selectedLabels,
            mergedRecords || [], // 🚀 使用 mergedRecords
            clearSelection,
          )
        }
        onClearSelection={clearSelection}
      />

      <SearchHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <ActionModals modalState={modalState} actions={actions} />
    </div>
  );
};
