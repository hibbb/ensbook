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
    // 外层容器：控制圆角和边框颜色
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ring-1 ring-slate-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <TableHeader
            sortConfig={props.sortConfig}
            onSort={props.onSort}
            filterConfig={props.filterConfig}
            onFilterChange={props.onFilterChange}
            isConnected={props.isConnected}
            showDelete={props.showDelete}
          />
          <tbody className="bg-white divide-y divide-slate-50">
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
                <td colSpan={props.showDelete ? 8 : 7} className="p-0">
                  <div className="px-6 py-24 text-center">
                    <div className="text-slate-300 text-4xl mb-3">∅</div>
                    <p className="text-slate-400 text-sm font-medium">
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
  <tr className="animate-pulse border-b border-slate-50 last:border-0">
    <td className="p-0">
      <div className="px-3 py-2 h-14 flex items-center justify-center">
        <div className="h-3 w-4 bg-slate-100 rounded"></div>
      </div>
    </td>
    <td className="p-0">
      <div className="px-3 py-2 h-14 flex items-center">
        <div className="h-4 w-24 bg-slate-100 rounded"></div>
      </div>
    </td>
    <td className="p-0">
      <div className="px-3 py-2 h-14 flex items-center">
        <div className="h-5 w-16 bg-slate-100 rounded-full"></div>
      </div>
    </td>
    <td className="p-0">
      <div className="px-3 py-2 h-14 flex items-center">
        <div className="h-3 w-20 bg-slate-100 rounded"></div>
      </div>
    </td>
    <td className="p-0">
      <div className="px-3 py-2 h-14 flex flex-col justify-center gap-2">
        <div className="h-3 w-24 bg-slate-100 rounded"></div>
        <div className="h-3 w-24 bg-slate-100 rounded"></div>
      </div>
    </td>
    <td className="p-0">
      <div className="px-3 py-2 h-14 flex items-center justify-center">
        <div className="h-4 w-4 bg-slate-100 rounded"></div>
      </div>
    </td>
    <td className="p-0">
      <div className="px-3 py-2 h-14 flex items-center justify-end">
        <div className="h-7 w-16 bg-slate-100 rounded-lg"></div>
      </div>
    </td>
  </tr>
);
