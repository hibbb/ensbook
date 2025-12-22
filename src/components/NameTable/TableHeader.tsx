import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortAlphaDown,
  faSortAmountDown,
  faUser,
  faCheck,
  faWallet,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

import { FilterDropdown } from "./FilterDropdown";
import {
  STATUS_OPTIONS,
  type SortField,
  type SortConfig,
  type FilterConfig,
} from "./types";

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  isConnected: boolean;
  showDelete?: boolean;
}

// 🚀 修复 1：将 SortIndicator 保持在组件外部
const SortIndicator = ({
  field,
  sortConfig,
}: {
  field: SortField;
  sortConfig: SortConfig;
}) => {
  const isActive = sortConfig.field === field;
  return (
    <span className="ml-1.5 inline-flex flex-col justify-center h-3 w-2 text-[8px] opacity-40">
      {!isActive && (
        <FontAwesomeIcon icon={faSort} className="text-slate-400" />
      )}
      {isActive &&
        (sortConfig.direction === "asc" ? (
          <FontAwesomeIcon
            icon={faSortUp}
            className="text-blue-600 opacity-100"
          />
        ) : (
          <FontAwesomeIcon
            icon={faSortDown}
            className="text-blue-600 opacity-100"
          />
        ))}
    </span>
  );
};

// 🚀 修复 2：将 ThWrapper 移到组件外部定义
// 遵循您的 UI 要求：内部 div 使用 px-3 py-2
const ThWrapper = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`px-3 py-2 h-full flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </div>
);

export const TableHeader = ({
  sortConfig,
  onSort,
  filterConfig,
  onFilterChange,
  isConnected,
  showDelete,
}: TableHeaderProps) => {
  return (
    <thead className="sticky top-0 z-20 shadow-sm bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
      <tr className="text-left">
        {/* 序号 */}
        <th className="p-0 w-14 first:rounded-tl-xl">
          <ThWrapper className="justify-center">序号</ThWrapper>
        </th>

        {/* 名称列 */}
        <th className="p-0">
          <ThWrapper>
            <div className="flex items-center gap-3">
              <span>名称</span>
              <div className="flex gap-1 pl-2 border-l border-slate-200/60">
                <button
                  onClick={() => onSort("label")}
                  className={`w-5 h-5 flex items-center justify-center rounded hover:bg-white transition-all ${sortConfig.field === "label" ? "text-blue-600 bg-white shadow-sm" : "text-slate-400"}`}
                  title="字母排序"
                >
                  <FontAwesomeIcon icon={faSortAlphaDown} size="sm" />
                </button>
                <button
                  onClick={() => onSort("length")}
                  className={`w-5 h-5 flex items-center justify-center rounded hover:bg-white transition-all ${sortConfig.field === "length" ? "text-blue-600 bg-white shadow-sm" : "text-slate-400"}`}
                  title="长度排序"
                >
                  <FontAwesomeIcon icon={faSortAmountDown} size="sm" />
                </button>
              </div>
            </div>
          </ThWrapper>
        </th>

        {/* 状态列 */}
        <th className="p-0">
          <ThWrapper>
            <div className="flex items-center gap-2">
              <span
                onClick={() => onSort("status")}
                className="cursor-pointer hover:text-slate-700 flex items-center transition-colors"
              >
                状态 <SortIndicator field="status" sortConfig={sortConfig} />
              </span>
              <FilterDropdown isActive={filterConfig.statusList.length > 0}>
                <div
                  className={`px-4 py-2 text-xs cursor-pointer hover:bg-slate-50 flex justify-between items-center ${filterConfig.statusList.length === 0 ? "text-blue-600 font-bold" : "text-slate-700"}`}
                  onClick={() =>
                    onFilterChange({ ...filterConfig, statusList: [] })
                  }
                >
                  全部显示
                  {filterConfig.statusList.length === 0 && (
                    <FontAwesomeIcon icon={faCheck} />
                  )}
                </div>
                {STATUS_OPTIONS.map((s) => (
                  <div
                    key={s}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-slate-700 text-[11px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newList = filterConfig.statusList.includes(s)
                        ? filterConfig.statusList.filter((i) => i !== s)
                        : [...filterConfig.statusList, s];
                      onFilterChange({ ...filterConfig, statusList: newList });
                    }}
                  >
                    {s}
                    {filterConfig.statusList.includes(s) && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-blue-600"
                      />
                    )}
                  </div>
                ))}
              </FilterDropdown>
            </div>
          </ThWrapper>
        </th>

        {/* 所有者列 */}
        <th className="p-0">
          <ThWrapper>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faWallet} className="text-slate-300" />
              <span>所有者</span>
              <button
                onClick={() =>
                  isConnected &&
                  onFilterChange({
                    ...filterConfig,
                    onlyMe: !filterConfig.onlyMe,
                  })
                }
                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${filterConfig.onlyMe ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:text-blue-500 hover:bg-blue-50"}`}
                title={isConnected ? "仅显示我的" : "请先连接钱包"}
              >
                <FontAwesomeIcon icon={faUser} size="xs" />
              </button>
            </div>
          </ThWrapper>
        </th>

        <th className="p-0">
          <ThWrapper>元数据</ThWrapper>
        </th>
        <th className="p-0 text-center">
          <ThWrapper className="justify-center">信息</ThWrapper>
        </th>

        {/* 操作列 */}
        <th className="p-0 last:rounded-tr-xl">
          <ThWrapper className="justify-end">
            <div className="flex items-center gap-2">
              <span>操作</span>
              <FilterDropdown
                isActive={filterConfig.actionType !== "all"}
                menuWidth="w-32 right-0"
              >
                {(["all", "register", "renew"] as const).map((type) => (
                  <div
                    key={type}
                    className={`px-4 py-2 text-[11px] hover:bg-slate-50 cursor-pointer ${filterConfig.actionType === type ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-600"}`}
                    onClick={() =>
                      onFilterChange({ ...filterConfig, actionType: type })
                    }
                  >
                    {type === "all"
                      ? "全部"
                      : type === "register"
                        ? "注册"
                        : "更新"}
                  </div>
                ))}
              </FilterDropdown>
            </div>
          </ThWrapper>
        </th>

        {showDelete && (
          <th className="p-0 text-center">
            <ThWrapper>删除</ThWrapper>
          </th>
        )}
      </tr>
    </thead>
  );
};
