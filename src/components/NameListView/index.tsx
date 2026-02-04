// src/components/NameListView/index.tsx

import { useCallback } from "react";
import { useAccount } from "wagmi";
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

interface NameListViewProps {
  // 1. 数据源
  records: NameRecord[] | undefined;
  isLoading: boolean;

  // 2. 上下文配置
  context: "home" | "collection";
  collectionId?: string;

  // 3. 差异化行为 (可选)
  onDelete?: (record: NameRecord) => void;
  onBatchDelete?: (criteria: DeleteCriteria) => void;
  onAddToHome?: (record: NameRecord) => void;
}

export const NameListView = ({
  records,
  isLoading,
  context,
  collectionId,
  onDelete,
  onBatchDelete,
  onAddToHome,
}: NameListViewProps) => {
  const { address, isConnected } = useAccount();

  // --- 核心逻辑集成 ---

  // 1. 视图状态管理
  const tableView = useNameTableView(records, address, context, collectionId);

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

  // --- 渲染 ---

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
        // 差异化回调
        onDelete={onDelete}
        onBatchDelete={onBatchDelete}
        onAddToHome={onAddToHome}
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
