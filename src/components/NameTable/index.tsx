// src/components/NameTable/index.tsx

import { useState, useEffect, useMemo } from "react";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { SkeletonRow } from "./SkeletonRow";
import { Pagination } from "../ui/Pagination";
// 🚀 1. 重新引入 ViewStateReset
import { ViewStateReset } from "./ViewStateReset";
import { usePrimaryNames } from "../../hooks/usePrimaryNames";
import { isRenewable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";
import type {
  SortField,
  SortConfig,
  FilterConfig,
  DeleteCriteria,
} from "./types";

interface NameTableProps {
  context: "home" | "collection";

  records: NameRecord[] | undefined | null;
  isLoading: boolean;
  currentAddress?: string;
  isConnected: boolean;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  canDelete?: boolean;
  onDelete?: (record: NameRecord) => void;
  onRegister?: (record: NameRecord) => void;
  onRenew?: (record: NameRecord) => void;
  onReminder?: (record: NameRecord) => void;
  selectedLabels?: Set<string>;
  onToggleSelection?: (label: string) => void;
  onToggleSelectAll?: () => void;
  skeletonRows?: number;
  headerTop?: string | number;
  pendingLabels?: Set<string>;
  totalRecordsCount?: number;
  statusCounts?: Record<string, number>;
  actionCounts?: { all: number; register: number; renew: number };
  onBatchDelete?: (criteria: DeleteCriteria) => void;
  nameCounts?: {
    lengthCounts: Record<number, number>;
    availableLengths: number[];
    wrappedCounts: { all: number; wrapped: number; unwrapped: number };
    memosCount?: number;
  };
  myCount?: number;
  ownershipCounts?: { mine: number; others: number };

  levelCounts?: Record<number, number>;
  // 🚀 这些是从页面透传进来的关键参数
  isViewStateDirty?: boolean;
  onResetViewState?: () => void;
  onLevelChange?: (record: NameRecord, newLevel: number) => void;
}

export const NameTable = (props: NameTableProps) => {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const safeRecords = useMemo(() => props.records || [], [props.records]);

  const [prevFilterConfig, setPrevFilterConfig] = useState(props.filterConfig);
  const [prevRecordsLen, setPrevRecordsLen] = useState(safeRecords.length);

  if (
    props.filterConfig !== prevFilterConfig ||
    safeRecords.length !== prevRecordsLen
  ) {
    setPrevFilterConfig(props.filterConfig);
    setPrevRecordsLen(safeRecords.length);
    setCurrentPage(1);
  }

  const paginatedBasicRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return safeRecords.slice(startIndex, startIndex + pageSize);
  }, [safeRecords, currentPage, pageSize]);

  const displayRecords = usePrimaryNames(paginatedBasicRecords);

  const isDataStale =
    displayRecords &&
    displayRecords.length > 0 &&
    paginatedBasicRecords.length > 0 &&
    displayRecords[0].label !== paginatedBasicRecords[0].label;

  const isResolvingPage =
    safeRecords.length > 0 && (!displayRecords || isDataStale);

  const showSkeleton = props.isLoading || isResolvingPage;
  const skeletonCount = props.skeletonRows || 8;

  const myCount = safeRecords.filter(
    (r) =>
      props.currentAddress &&
      r.owner?.toLowerCase() === props.currentAddress.toLowerCase(),
  ).length;

  const ownershipCounts = {
    mine: myCount,
    others: safeRecords.length - myCount,
  };

  const renewableRecords = safeRecords.filter((r) => isRenewable(r.status));
  const hasRenewableRecords = renewableRecords.length > 0;

  const statusSet = new Set<string>();
  safeRecords.forEach((r) => statusSet.add(r.status));
  const uniqueStatuses = Array.from(statusSet).sort();

  const isAllSelected =
    hasRenewableRecords &&
    props.selectedLabels &&
    renewableRecords.every((r) => props.selectedLabels?.has(r.label));

  return (
    <div className="bg-table-row rounded-xl border border-gray-100 relative flex flex-col">
      <div className="overflow-x-auto lg:overflow-visible">
        <table className="min-w-full border-separate border-spacing-x-0 border-spacing-y-1 bg-background [&_td]:p-0 [&_th]:p-0 [&_td>div]:px-2 [&_td>div]:py-2 [&_th>div]:px-2 [&_th>div]:py-3">
          <TableHeader
            sortConfig={props.sortConfig}
            onSort={props.onSort}
            filterConfig={props.filterConfig}
            onFilterChange={props.onFilterChange}
            isConnected={props.isConnected}
            isAllSelected={!!isAllSelected}
            onToggleSelectAll={props.onToggleSelectAll}
            hasRenewable={hasRenewableRecords}
            hasRecords={safeRecords.length > 0}
            showDelete={props.canDelete}
            topOffset={props.headerTop}
            onBatchDelete={props.onBatchDelete}
            uniqueStatuses={uniqueStatuses}
            filteredCount={safeRecords.length}
            totalCount={props.totalRecordsCount ?? safeRecords.length}
            statusCounts={props.statusCounts}
            actionCounts={props.actionCounts}
            nameCounts={props.nameCounts}
            myCount={myCount}
            ownershipCounts={ownershipCounts}
            levelCounts={props.levelCounts}
          />
          <tbody>
            {showSkeleton ? (
              Array.from({ length: skeletonCount }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : safeRecords.length > 0 ? (
              (displayRecords || paginatedBasicRecords).map((r, i) => (
                <TableRow
                  key={r.namehash}
                  record={r}
                  index={i + (currentPage - 1) * pageSize}
                  now={now}
                  context={props.context}
                  currentAddress={props.currentAddress}
                  isConnected={props.isConnected}
                  canDelete={props.canDelete}
                  onDelete={props.onDelete}
                  isSelected={props.selectedLabels?.has(r.label)}
                  onToggleSelection={props.onToggleSelection}
                  onRegister={props.onRegister}
                  onRenew={props.onRenew}
                  onReminder={props.onReminder}
                  isPending={props.pendingLabels?.has(r.label)}
                  onLevelChange={props.onLevelChange}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="px-6 py-24 text-center">
                    <div className="text-gray-300 text-4xl mb-3">∅</div>
                    <p className="text-gray-400 text-sm">暂无数据</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!showSkeleton && safeRecords.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalCount={safeRecords.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* 🚀 2. 补回 ViewStateReset 组件 */}
      <ViewStateReset
        isVisible={!!props.isViewStateDirty}
        onReset={props.onResetViewState || (() => {})}
        hasSelection={!!(props.selectedLabels && props.selectedLabels.size > 0)}
        totalCount={props.totalRecordsCount ?? safeRecords.length}
        filteredCount={safeRecords.length}
      />
    </div>
  );
};
