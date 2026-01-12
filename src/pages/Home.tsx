// src/pages/Home.tsx

import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableView } from "../components/NameTable/useNameTableView";
import { SearchHelpModal } from "../components/SearchHelpModal";
import { HomeSearchSection } from "./Home/HomeSearchSection";
import { FloatingBar } from "../components/FloatingBar"; // 🚀 使用通用组件
import { ActionModals } from "../components/ActionModals"; // 🚀 使用通用组件

// Hooks & Services
import { useNameRecords } from "../hooks/useEnsData";
import { useEnsActions } from "../hooks/useEnsActions"; // 🚀 引入新 Hook
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
  // --- 1. 基础 Hooks ---
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  useDocumentTitle("Home");

  // --- 2. 本地状态 ---
  const [resolvedLabels, setResolvedLabels] = useState<string[]>(() =>
    getHomeLabels(),
  );
  const [inputValue, setInputValue] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // --- 3. 数据获取 ---
  const { data: records, isLoading: isQuerying } =
    useNameRecords(resolvedLabels);

  const showSkeleton = isQuerying || isResolving;
  const hasContent = resolvedLabels.length > 0;

  const validRecords = useMemo(() => {
    if (!records || resolvedLabels.length === 0) return [];
    const currentLabelSet = new Set(resolvedLabels);
    return records.filter((r) => currentLabelSet.has(r.label));
  }, [records, resolvedLabels]);

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
  } = useNameTableView(validRecords, address, "home");

  // --- 5. 核心业务逻辑 (注册/续费/提醒) ---
  // 🚀 一行代码接管所有交易流程
  const { pendingLabels, isBusy, modalState, actions } = useEnsActions();

  // --- 6. 辅助逻辑 (Level 更新) ---
  const updateLevel = useOptimisticLevelUpdate();
  const handleLevelChange = (record: NameRecord, newLevel: number) => {
    updateLevel(record, newLevel);
  };

  // --- 7. 事件处理 ---

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
  };

  // --- 8. 渲染 ---

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
            onRegister={actions.onRegister} // 🚀
            onRenew={actions.onRenew} // 🚀
            onReminder={actions.onReminder} // 🚀
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

      <FloatingBar
        selectedCount={selectedLabels.size}
        isBusy={isBusy}
        isConnected={isConnected}
        onBatchRenew={() => actions.onBatchRenew(selectedLabels)} // 🚀
        onClearSelection={clearSelection}
      />

      <SearchHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* 🚀 统一模态框 */}
      <ActionModals modalState={modalState} actions={actions} />
    </div>
  );
};
