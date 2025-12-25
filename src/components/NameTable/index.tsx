import { useState } from "react";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import type { NameRecord } from "../../types/ensNames";
import type { SortField, SortConfig, FilterConfig } from "./types";

export type { SortField, SortConfig, FilterConfig };

interface NameTableProps {
  records: NameRecord[] | undefined | null; // 支持 undefined
  isLoading: boolean;
  currentAddress?: string;
  isConnected: boolean;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  canDelete?: boolean;
}

export const NameTable = (props: NameTableProps) => {
  const [now] = useState(() => Math.floor(Date.now() / 1000));

  // 🚀 核心逻辑修复：
  // 只有当 records 确实有值（哪怕是空数组）时，才认为加载结束。
  // 只要 records 是 undefined 或 null，就强制显示骨架屏。
  // 这样即便 isLoading 状态有延迟，UI 也会稳健地停留在骨架屏状态。
  const shouldShowSkeleton = props.isLoading || !props.records;

  // 安全转换，仅用于渲染列表
  const safeRecords = props.records || [];

  return (
    <div className="bg-table-row overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="min-w-full border-separate border-spacing-x-0 border-spacing-y-1 bg-background
          [&_td]:p-0 [&_th]:p-0
          [&_td>div]:px-2 [&_td>div]:py-1.5
          [&_th>div]:px-2 [&_th>div]:py-1.5"
        >
          <TableHeader
            sortConfig={props.sortConfig}
            onSort={props.onSort}
            filterConfig={props.filterConfig}
            onFilterChange={props.onFilterChange}
            isConnected={props.isConnected}
          />

          <tbody>
            {shouldShowSkeleton ? (
              // 显示 8 行骨架屏
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
                />
              ))
            ) : (
              <tr>
                <td colSpan={8}>
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

// 骨架屏组件：样式微调，确保可见性
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
      <div className="h-14 flex flex-col justify-center gap-2">
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
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
