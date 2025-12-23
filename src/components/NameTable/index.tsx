import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import type { NameRecord } from "../../types/ensNames";
import type {
  SortField,
  SortDirection,
  SortConfig,
  FilterConfig,
} from "./types";

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
    <div className="bg-table-row overflow-hidden">
      <div className="overflow-x-auto">
        {/* 🚀 样式注入：在此处统一管理单元格内边距
            [&_td]:p-0 -> 所有 td padding 为 0
            [&_th]:p-0 -> 所有 th padding 为 0
            [&_td>div]:px-3 -> 所有 td 下的第一层 div 水平内边距 3
            ...以此类推
        */}
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
            showDelete={props.showDelete}
          />
          <tbody>
            {props.isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
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
                <td colSpan={props.showDelete ? 8 : 7}>
                  <div className="px-6 py-24 text-center">
                    <div className="text-gray-300 text-4xl mb-3">∅</div>
                    <p className="text-gray-400 text-sm font-medium">
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

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50 last:border-0">
    <td>
      <div className="h-14 flex items-center justify-center">
        <div className="h-3 w-4 bg-gray-100 rounded"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center">
        <div className="h-4 w-24 bg-gray-100 rounded"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center">
        <div className="h-5 w-16 bg-gray-100 rounded-full"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center">
        <div className="h-3 w-20 bg-gray-100 rounded"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex flex-col justify-center gap-2">
        <div className="h-3 w-24 bg-gray-100 rounded"></div>
        <div className="h-3 w-24 bg-gray-100 rounded"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center justify-center">
        <div className="h-4 w-4 bg-gray-100 rounded"></div>
      </div>
    </td>
    <td>
      <div className="h-14 flex items-center justify-end">
        <div className="h-7 w-16 bg-gray-100 rounded-lg"></div>
      </div>
    </td>
  </tr>
);
