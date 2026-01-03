// src/components/NameTable/index.tsx

import { useState, useEffect, useMemo } from "react";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { Pagination } from "../ui/Pagination";
import { isRenewable } from "../../utils/ens";
import { usePrimaryNames } from "../../hooks/usePrimaryNames";
import type { NameRecord } from "../../types/ensNames";
import type {
  SortField,
  SortConfig,
  FilterConfig,
  DeleteCriteria,
} from "./types";

interface NameTableProps {
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
  };
  myCount?: number;
  ownershipCounts?: { mine: number; others: number };
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

  // 1. 切片
  const paginatedBasicRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return safeRecords.slice(startIndex, startIndex + pageSize);
  }, [safeRecords, currentPage, pageSize]);

  // 2. 解析
  const displayRecords = usePrimaryNames(paginatedBasicRecords);

  // 🚀 3. 智能防闪烁逻辑 (Smart Skeleton Trigger)
  // 当翻页时，paginatedBasicRecords 会立即更新为新页数据。
  // 但 displayRecords 是异步的，可能还保留着上一页的数据 (React Query 缓存或状态更新滞后)。
  // 如果我们检测到 label 不匹配，说明数据正在解析中 (Stale)，必须强制显示骨架屏。
  const isDataStale =
    displayRecords &&
    displayRecords.length > 0 &&
    paginatedBasicRecords.length > 0 &&
    displayRecords[0].label !== paginatedBasicRecords[0].label;

  // 状态汇总：父组件加载中 OR 解析未完成 OR 解析数据过时
  const isResolvingPage =
    safeRecords.length > 0 && (!displayRecords || isDataStale);

  const showSkeleton = props.isLoading || isResolvingPage;
  const skeletonCount = props.skeletonRows || 8;

  // ... (统计逻辑保持不变) ...
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
          />
          <tbody>
            {showSkeleton ? (
              Array.from({ length: skeletonCount }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : safeRecords.length > 0 ? (
              // 此时数据已就绪且匹配，放心渲染
              displayRecords!.map((r, i) => (
                <TableRow
                  key={r.namehash}
                  record={r}
                  index={i + (currentPage - 1) * pageSize}
                  now={now}
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
    </div>
  );
};

const SkeletonRow = () => (
  // ... 保持不变
  <tr className="animate-pulse border-b border-gray-50 last:border-0 bg-white/50">
    <td>
      <div className="h-14 flex items-center justify-center">
        <div className="h-3 w-4 bg-gray-200 rounded"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center">
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center">
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center justify-center gap-2">
        <div className="h-5 w-5 bg-gray-200 rounded"></div>
        <div className="h-5 w-5 bg-gray-200 rounded"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center justify-end">
        <div className="h-7 w-16 bg-gray-200 rounded-lg"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center justify-center">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
      </div>
    </td>
  </tr>
);
