// src/pages/CollectionDetail.tsx

import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableView } from "../components/NameTable/useNameTableView";
import { FloatingBar } from "../components/FloatingBar";
import { ActionModals } from "../components/ActionModals";

// Hooks & Services
import { useCollectionRecords } from "../hooks/useEnsData";
import { useEnsActions } from "../hooks/useEnsActions";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useOptimisticLevelUpdate } from "../hooks/useOptimisticLevelUpdate";

// Config & Utils
import { ENS_COLLECTIONS } from "../config/collections";
import type { NameRecord } from "../types/ensNames";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { address, isConnected } = useAccount();
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
    levelCounts,
    isViewStateDirty,
    resetViewState,
    ownerCounts, // 🚀
    ownerStats, // 🚀
  } = useNameTableView(records, address, "collection", id);

  const { pendingLabels, isBusy, modalState, actions } = useEnsActions();

  const updateLevel = useOptimisticLevelUpdate();
  const handleLevelChange = (record: NameRecord, newLevel: number) => {
    updateLevel(record, newLevel);
  };

  const selectionCount = selectedLabels.size;

  if (!collection)
    return <div className="p-20 text-center">{t("collection.not_found")}</div>;
  if (isError)
    return (
      <div className="p-20 text-center text-red-500">
        {t("collection.load_fail")}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto lg:px-4 py-10 pb-24 relative">
      <header className="mb-10">
        <h1 className="text-4xl font-qs-semibold">
          {t(collection.displayName)}
        </h1>
        <p className="text-gray-400 mt-2 ml-2">{t(collection.description)}</p>
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
        onRegister={actions.onRegister}
        onRenew={actions.onRenew}
        onReminder={actions.onReminder}
        pendingLabels={pendingLabels}
        totalRecordsCount={records?.length || 0}
        statusCounts={statusCounts}
        actionCounts={actionCounts}
        nameCounts={nameCounts}
        levelCounts={levelCounts}
        isViewStateDirty={isViewStateDirty}
        onResetViewState={resetViewState}
        onLevelChange={handleLevelChange}
        ownerCounts={ownerCounts} // 🚀
        ownerStats={ownerStats} // 🚀
      />

      <FloatingBar
        selectedCount={selectionCount}
        isBusy={isBusy}
        isConnected={isConnected}
        onBatchRenew={() => actions.onBatchRenew(selectedLabels)}
        onClearSelection={clearSelection}
      />

      <ActionModals modalState={modalState} actions={actions} />
    </div>
  );
};
