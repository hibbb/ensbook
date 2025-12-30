// src/components/NameTable/index.tsx

import { useState, useEffect } from "react"; // 🚀 1. 移除 useMemo 引用
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
  onBatchDelete?: (status?: string) => void;
  // 🚀 新增：透传回调接口
  onRegister?: (record: NameRecord) => void;
  onRenew?: (record: NameRecord) => void;
  selectedLabels?: Set<string>;
  onToggleSelection?: (label: string) => void;
  onToggleSelectAll?: () => void;
  skeletonRows?: number;
  headerTop?: string | number;
}

export const NameTable = (props: NameTableProps) => {
  // 1. 计时器：每秒更新 now，这会强制组件重渲染
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shouldShowSkeleton = props.isLoading || !props.records;
  const skeletonCount = props.skeletonRows || 8;

  // 🚀 核心修复：直接赋值，不使用 useMemo
  const safeRecords = props.records || [];

  // 🚀 2. 移除 renewableRecords 的 useMemo
  const renewableRecords = safeRecords.filter((r) => isRenewable(r.status));

  const hasRenewableRecords = renewableRecords.length > 0;

  // 🚀 3. 移除 uniqueStatuses 的 useMemo，改为直接计算
  // 由于列表通常只有几百条，直接计算的开销极低，且能保证绝对的准确性
  const statusSet = new Set<string>();
  safeRecords.forEach((r) => statusSet.add(r.status));
  const uniqueStatuses = Array.from(statusSet).sort();

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
            onBatchDelete={props.onBatchDelete}
            uniqueStatuses={uniqueStatuses}
          />
          <tbody>
            {/* ... 渲染逻辑保持不变 ... */}
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
                  // 🚀 透传 props
                  onRegister={props.onRegister}
                  onRenew={props.onRenew}
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
};

// ... SkeletonRow 保持不变

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
