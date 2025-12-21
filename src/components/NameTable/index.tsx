// src/components/NameTable/index.tsx
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import type { NameRecord } from "../../types/ensNames"; //
import type {
  SortField,
  SortDirection,
  SortConfig,
  FilterConfig,
} from "./types"; //

// 🚀 核心修复：添加 SortDirection 的显式导出
export type { SortField, SortDirection, SortConfig, FilterConfig };

interface NameTableProps {
  records: NameRecord[];
  isLoading: boolean;
  currentAddress?: string;
  isConnected: boolean;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  showDelete?: boolean;
}

export const NameTable = (props: NameTableProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-visible">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
          <TableHeader
            sortConfig={props.sortConfig}
            onSort={props.onSort}
            filterConfig={props.filterConfig}
            onFilterChange={props.onFilterChange}
            isConnected={props.isConnected}
            showDelete={props.showDelete}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {props.isLoading ? (
              Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} />)
            ) : props.records.length > 0 ? (
              props.records.map((r, i) => (
                <TableRow
                  key={r.namehash}
                  record={r}
                  index={i}
                  currentAddress={props.currentAddress}
                  isConnected={props.isConnected}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={props.showDelete ? 8 : 7}
                  className="px-6 py-24 text-center text-gray-400 italic bg-gray-50/30"
                >
                  没有找到符合当前筛选条件的域名
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
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-6 py-5">
        <div className="h-3 bg-gray-100 rounded-full w-full"></div>
      </td>
    ))}
  </tr>
);
