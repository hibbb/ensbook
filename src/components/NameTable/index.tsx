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
  onClearAll?: () => void;
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

  // 🚀 核心修复：彻底移除 useMemo！
  // 之前版本：const safeRecords = useMemo(() => props.records || [], [props.records]);
  // 这会导致当 props.records 引用未变但内部对象属性（如 ownerPrimaryName）更新时，safeRecords 不更新。
  // 修改后：直接赋值。配合上面的计时器重渲染，确保每一秒都能读取到对象的最新状态。
  const safeRecords = props.records || [];

  // 这里其实不需要 useMemo，因为 safeRecords 已经是新的了，filter 开销很小。
  // 为了彻底防止缓存陷阱，直接计算。
  const renewableRecords = safeRecords.filter((r) => isRenewable(r.status));

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
            onClearAll={props.onClearAll}
          />
          <tbody>
            {shouldShowSkeleton ? (
              Array.from({ length: skeletonCount }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : safeRecords.length > 0 ? (
              safeRecords.map((r, i) => (
                <TableRow
                  // 使用 namehash 作为 key，确保 React 能正确追踪 DOM
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
};

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
