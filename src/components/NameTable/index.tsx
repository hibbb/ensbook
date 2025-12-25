import { useState } from "react";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import type { NameRecord } from "../../types/ensNames";
import type { SortField, SortConfig, FilterConfig } from "./types";

export type { SortField, SortConfig, FilterConfig };

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
  selectedLabels?: Set<string>;
  onToggleSelection?: (label: string) => void;
  onToggleSelectAll?: () => void;
}

export const NameTable = (props: NameTableProps) => {
  const [now] = useState(() => Math.floor(Date.now() / 1000));

  const shouldShowSkeleton = props.isLoading || !props.records;
  const safeRecords = props.records || [];

  const isAllSelected =
    safeRecords.length > 0 &&
    props.selectedLabels &&
    safeRecords.every((r) => props.selectedLabels?.has(r.label));

  return (
    <div className="bg-table-row overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="min-w-full border-separate border-spacing-x-0 border-spacing-y-1 bg-background
          [&_td]:p-0 [&_th]:p-0
          [&_td>div]:px-2 [&_td>div]:py-2
          [&_th>div]:px-2 [&_th>div]:py-2.5"
        >
          <TableHeader
            sortConfig={props.sortConfig}
            onSort={props.onSort}
            filterConfig={props.filterConfig}
            onFilterChange={props.onFilterChange}
            isConnected={props.isConnected}
            isAllSelected={!!isAllSelected}
            onToggleSelectAll={props.onToggleSelectAll}
            hasRecords={safeRecords.length > 0}
            // 确保 canDelete 透传给 Header 如果有需要（目前 Header 没直接用到删除显示逻辑，但为了接口完整性）
            showDelete={props.canDelete}
          />

          <tbody>
            {shouldShowSkeleton ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
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
                  isSelected={props.selectedLabels?.has(r.label)}
                  onToggleSelection={props.onToggleSelection}
                />
              ))
            ) : (
              <tr>
                {/* 🚀 colSpan 调整为 7 */}
                <td colSpan={7}>
                  <div className="px-6 py-24 text-center">
                    <div className="text-gray-300 text-4xl mb-3">∅</div>
                    <p className="text-gray-400 text-sm">
                      没有找到符合当前筛选条件的域名
                    </p>
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

// 骨架屏组件：移除了第5列（元数据）
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
    {/* 🚀 元数据列已移除 */}
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
