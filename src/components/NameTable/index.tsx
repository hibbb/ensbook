// src/components/NameTable/index.tsx

import { useState, useMemo, memo, useEffect } from "react";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { isRenewable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";
import type { SortField, SortConfig, FilterConfig } from "./types";

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
  // 🚀 1. 新增：接收 Home 传来的清空回调
  onClearAll?: () => void;
  selectedLabels?: Set<string>;
  onToggleSelection?: (label: string) => void;
  onToggleSelectAll?: () => void;
  skeletonRows?: number;
  headerTop?: string | number;
}

export const NameTable = memo((props: NameTableProps) => {
  // 1. 初始化状态
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  // 🚀 修复：添加定时器，每秒更新 now 状态，驱动倒计时跳动
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shouldShowSkeleton = props.isLoading || !props.records;
  const safeRecords = useMemo(() => props.records || [], [props.records]);
  const skeletonCount = props.skeletonRows || 8;
  const renewableRecords = useMemo(() => {
    return safeRecords.filter((r) => isRenewable(r.status));
  }, [safeRecords]);
  const hasRenewableRecords = renewableRecords.length > 0;
  const isAllSelected =
    hasRenewableRecords &&
    props.selectedLabels &&
    renewableRecords.every((r) => props.selectedLabels?.has(r.label));

  return (
    <div className="bg-table-row rounded-xl border border-gray-100 relative">
      <div className="overflow-x-auto lg:overflow-visible">
        <table
          className="min-w-full border-separate border-spacing-x-0 border-spacing-y-1 bg-background
          [&_td]:p-0 [&_th]:p-0 [&_td>div]:px-2 [&_td>div]:py-2 [&_th>div]:px-2 [&_th>div]:py-2.5"
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
            showDelete={props.canDelete}
            topOffset={props.headerTop}
            onClearAll={props.onClearAll} // 🚀 2. 传递给 TableHeader (修复断链)
          />
          <tbody>
            {shouldShowSkeleton ? (
              Array.from({ length: skeletonCount }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : safeRecords.length > 0 ? (
              safeRecords.map((r, i) => (
                <TableRow
                  key={r.namehash}
                  record={r}
                  index={i}
                  now={now}
                  currentAddress={props.currentAddress}
                  isConnected={props.isConnected}
                  canDelete={props.canDelete}
                  onDelete={props.onDelete}
                  isSelected={props.selectedLabels?.has(r.label)}
                  onToggleSelection={props.onToggleSelection}
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
    </div>
  );
});

const SkeletonRow = () => (
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
