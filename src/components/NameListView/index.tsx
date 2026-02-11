// src/components/NameListView/index.tsx

import { useCallback, useMemo } from "react";
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
  isOwnerColumnReadOnly?: boolean;
}

export const NameListView = ({
  records,
  isLoading,
  context,
  collectionId,
  onDelete,
  onBatchDelete,
  onAddToHome,
  isOwnerColumnReadOnly,
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

  // 4. 智能判断逻辑：
  // 4.1. Home 页面：显示
  // 4.2. Mine 页面 (context='collection' & id='mine')：显示
  // 4.3. Account 页面 (context='collection' & id=address)：显示
  // 4.4. 具体集合页面 (context='collection' & id='999'/'bip39')：隐藏

  const shouldShowTags = useMemo(() => {
    if (context === "home") return true;

    // 如果是 "mine" 或者 是以太坊地址(Account页)，则显示
    // 注意：Account 页面的 collectionId 是地址
    if (
      collectionId === "mine" ||
      (collectionId && collectionId.startsWith("0x"))
    ) {
      return true;
    }

    // 其他情况（即具体的预置集合页，如 999, bip39），隐藏
    return false;
  }, [context, collectionId]);

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
        isOwnerColumnReadOnly={isOwnerColumnReadOnly}
        showCollectionTags={shouldShowTags}
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
