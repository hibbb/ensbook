// src/components/NameTable/index.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { SkeletonRow } from "./SkeletonRow";
import { Pagination } from "../ui/Pagination";
import { ViewStateReset } from "./ViewStateReset";
import { usePrimaryNames } from "../../hooks/usePrimaryNames";
import { useMarketData } from "../../hooks/useMarketData";
import { isRenewable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";
import type {
  SortField,
  SortConfig,
  FilterConfig,
  DeleteCriteria,
} from "./types";

import { ITEMS_PER_PAGE } from "../../config/constants";

interface NameTableProps {
  records: NameRecord[] | undefined | null;
  isLoading: boolean;
  isConnected: boolean;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  onDelete?: (record: NameRecord) => void;
  onAddToHome?: (record: NameRecord) => void;
  onRegister?: (record: NameRecord) => void;
  onRenew?: (record: NameRecord) => void;
  onReminder?: (record: NameRecord) => void;
  selectedLabels?: Set<string>;
  onToggleSelection?: (label: string) => void;
  onToggleSelectAll?: () => void;
  skeletonRows?: number;
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
    memoTotal?: number;
  };
  ownershipCounts?: { mine: number; others: number };
  levelCounts?: Record<number, number>;
  isViewStateDirty?: boolean;
  onResetViewState?: () => void;
  onLevelChange?: (record: NameRecord, newLevel: number) => void;
  ownerCounts?: {
    count: number;
    label: string;
    address: string;
    isMyself: boolean;
  }[];
  ownerStats?: { total: number; displayed: number };
  isOwnerColumnReadOnly?: boolean; // 🚀 新增
}

const NameTableComponent = (props: NameTableProps) => {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = ITEMS_PER_PAGE;
  const { t } = useTranslation();

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

  const { data: marketDataMap, isLoading: isMarketLoading } = useMarketData(
    paginatedBasicRecords,
  );

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

  const ownershipCounts = props.ownershipCounts || { mine: 0, others: 0 };

  const renewableRecords = safeRecords.filter((r) => isRenewable(r.status));
  const hasRenewableRecords = renewableRecords.length > 0;

  const statusSet = new Set<string>();
  safeRecords.forEach((r) => statusSet.add(r.status));
  const uniqueStatuses = Array.from(statusSet).sort();

  const isAllSelected =
    hasRenewableRecords &&
    props.selectedLabels &&
    renewableRecords.every((r) => props.selectedLabels?.has(r.label));

  // 1. 明确判断是否显示分页
  // 分页显示的条件是：非 Loading 状态 且 数据量大于一页
  const showPagination = !showSkeleton && safeRecords.length > pageSize;

  // 2. 定义动态圆角类
  // 解释：
  // [&_tr:last-child_td:first-child]: 选中 tbody 中最后一行的第一个单元格 -> 左下圆角
  // [&_tr:last-child_td:last-child]:  选中 tbody 中最后一行的最后一个单元格 -> 右下圆角
  const bottomRoundedClass = !showPagination
    ? "[&_tr:last-child_td:first-child]:rounded-bl-xl [&_tr:last-child_td:last-child]:rounded-br-xl"
    : "";

  return (
    <div className="rounded-xl border border-gray-100 relative flex flex-col">
      <div className="overflow-x-auto lg:overflow-visible rounded-t-xl">
        <table
          className={`min-w-full border-separate border-spacing-x-0 border-spacing-y-0.5 bg-background [&_td]:p-0 [&_th]:p-0 [&_td>div]:px-2 [&_td>div]:py-2 [&_th>div]:px-2 [&_th>div]:py-3 ${bottomRoundedClass}`}
        >
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
            onBatchDelete={props.onBatchDelete}
            onAddToHome={props.onAddToHome}
            uniqueStatuses={uniqueStatuses}
            filteredCount={safeRecords.length}
            totalCount={props.totalRecordsCount ?? safeRecords.length}
            statusCounts={props.statusCounts}
            actionCounts={props.actionCounts}
            nameCounts={props.nameCounts}
            ownershipCounts={ownershipCounts}
            levelCounts={props.levelCounts}
            ownerCounts={props.ownerCounts}
            ownerStats={props.ownerStats}
            // 🚀 新增：将 isOwnerColumnReadOnly 传递给表头
            isOwnerColumnReadOnly={props.isOwnerColumnReadOnly}
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
                  isConnected={props.isConnected}
                  onDelete={props.onDelete}
                  onAddToHome={props.onAddToHome}
                  isSelected={props.selectedLabels?.has(r.label)}
                  onToggleSelection={props.onToggleSelection}
                  onRegister={props.onRegister}
                  onRenew={props.onRenew}
                  onReminder={props.onReminder}
                  isPending={props.pendingLabels?.has(r.label)}
                  onLevelChange={props.onLevelChange}
                  marketData={marketDataMap?.[r.label]}
                  isMarketLoading={isMarketLoading}
                  isOwnerColumnReadOnly={props.isOwnerColumnReadOnly} // 🚀 传递
                />
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="px-6 py-24 text-center">
                    <div className="text-gray-300 text-4xl mb-3">∅</div>
                    <p className="text-gray-400 text-sm">{t("table.empty")}</p>
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

export const NameTable = React.memo(NameTableComponent);
