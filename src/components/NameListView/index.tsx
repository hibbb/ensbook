// src/components/NameListView/index.tsx

import { useCallback } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type { NameRecord } from "../../types/ensNames";
import type { DeleteCriteria } from "../NameTable/types";

// Hooks
import { useNameTableView } from "../NameTable/useNameTableView";
import { useEnsActions } from "../../hooks/useEnsActions";
import { useOptimisticLevelUpdate } from "../../hooks/useOptimisticLevelUpdate";

// Components
import { NameTable } from "../NameTable";
import { FloatingBar } from "../FloatingBar";
import { ActionModals } from "../ActionModals";

// Services
import { addToHome, getHomeLabels } from "../../services/storage/userStore";

interface NameListViewProps {
  // 1. 数据源
  records: NameRecord[] | undefined;
  isLoading: boolean;

  // 2. 视图状态 Key (必填)
  viewStateKey: string;

  // 3. 功能开关 (明确的配置项)
  showCollectionTags?: boolean; // 是否显示集合标记
  isOwnerColumnReadOnly?: boolean; // 所有者列是否只读
  allowAddToHome?: boolean; // 是否允许添加到首页

  // 4. 回调
  onDelete?: (record: NameRecord) => void;
  onBatchDelete?: (criteria: DeleteCriteria) => void;
}

export const NameListView = ({
  records,
  isLoading,
  viewStateKey,
  showCollectionTags = true,
  isOwnerColumnReadOnly = false,
  allowAddToHome = false,
  onDelete,
  onBatchDelete,
}: NameListViewProps) => {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();

  // 1. 视图状态管理 (传入 viewStateKey)
  const tableView = useNameTableView(records, address, viewStateKey);

  // 2. 交易动作管理
  const ensActions = useEnsActions();

  // 3. 等级更新管理
  const updateLevel = useOptimisticLevelUpdate();
  const handleLevelChange = useCallback(
    (record: NameRecord, newLevel: number) => {
      updateLevel(record, newLevel);
    },
    [updateLevel],
  );

  // 4. 通用处理：添加到首页
  const handleAddToHome = useCallback(
    (record: NameRecord) => {
      const currentList = getHomeLabels();
      const exists = currentList.includes(record.label);
      addToHome(record.label);
      if (exists) {
        toast(t("home.toast.all_exist"), { icon: "👌" });
      } else {
        toast.success(t("home.toast.add_success", { count: 1 }));
      }
    },
    [t],
  );

  return (
    <>
      <NameTable
        // 数据与加载状态
        records={tableView.processedRecords}
        isLoading={isLoading}
        isConnected={isConnected}
        // 视图状态
        sortConfig={tableView.sortConfig}
        onSort={tableView.handleSort}
        filterConfig={tableView.filterConfig}
        onFilterChange={tableView.setFilterConfig}
        // 选择状态
        selectedLabels={tableView.selectedLabels}
        onToggleSelection={tableView.toggleSelection}
        onToggleSelectAll={tableView.toggleSelectAll}
        // 统计数据
        totalRecordsCount={records?.length || 0}
        statusCounts={tableView.statusCounts}
        actionCounts={tableView.actionCounts}
        nameCounts={tableView.nameCounts}
        levelCounts={tableView.levelCounts}
        ownerCounts={tableView.ownerCounts}
        ownerStats={tableView.ownerStats}
        ownershipCounts={tableView.ownershipCounts}
        // 视图重置
        isViewStateDirty={tableView.isViewStateDirty}
        onResetViewState={tableView.resetViewState}
        // 交易动作
        pendingLabels={ensActions.pendingLabels}
        onRegister={ensActions.actions.onRegister}
        onRenew={ensActions.actions.onRenew}
        onReminder={ensActions.actions.onReminder}
        // 等级更新
        onLevelChange={handleLevelChange}
        // 差异化配置
        showCollectionTags={showCollectionTags}
        isOwnerColumnReadOnly={isOwnerColumnReadOnly}
        onAddToHome={allowAddToHome ? handleAddToHome : undefined}
        onDelete={onDelete}
        onBatchDelete={onBatchDelete}
      />

      <FloatingBar
        selectedCount={tableView.selectedLabels.size}
        isBusy={ensActions.isBusy}
        isConnected={isConnected}
        onBatchRenew={() =>
          ensActions.actions.onBatchRenew(
            tableView.selectedLabels,
            records || [],
            tableView.clearSelection,
          )
        }
        onClearSelection={tableView.clearSelection}
      />

      <ActionModals
        modalState={ensActions.modalState}
        actions={ensActions.actions}
      />
    </>
  );
};
