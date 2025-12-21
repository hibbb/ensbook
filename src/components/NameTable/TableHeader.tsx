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

// 🚀 修复问题 2：将辅助组件移出渲染函数外部
const SortIndicator = ({
  field,
  sortConfig,
}: {
  field: SortField;
  sortConfig: SortConfig;
}) => {
  const isActive = sortConfig.field === field;
  return (
    <span className="ml-1 inline-flex flex-col justify-center h-4 w-2 text-[10px] opacity-50">
      {!isActive && <FontAwesomeIcon icon={faSort} className="text-gray-300" />}
      {isActive &&
        (sortConfig.direction === "asc" ? (
          <FontAwesomeIcon icon={faSortUp} className="text-blue-600" />
        ) : (
          <FontAwesomeIcon icon={faSortDown} className="text-blue-600" />
        ))}
    </span>
  );
};

export const TableHeader = ({
  sortConfig,
  onSort,
  filterConfig,
  onFilterChange,
  isConnected,
  showDelete,
}: TableHeaderProps) => {
  return (
    <thead className="sticky top-0 z-20 shadow-sm select-none bg-gray-50">
      <tr className="text-left text-xs font-bold text-gray-500 uppercase bg-gray-50">
        <th className="px-6 py-4 w-16 first:rounded-tl-xl">序号</th>

        {/* 名称列 */}
        <th className="px-6 py-4">
          <div className="flex items-center gap-3">
            <span>名称</span>
            <div className="flex gap-2 border-l pl-2 border-gray-200">
              <button
                onClick={() => onSort("label")}
                className={`transition-colors ${sortConfig.field === "label" ? "text-blue-600" : "text-gray-300 hover:text-blue-400"}`}
              >
                <FontAwesomeIcon icon={faSortAlphaDown} />
              </button>
              <button
                onClick={() => onSort("length")}
                className={`transition-colors ${sortConfig.field === "length" ? "text-blue-600" : "text-gray-300 hover:text-blue-400"}`}
              >
                <FontAwesomeIcon icon={faSortAmountDown} />
              </button>
            </div>
          </div>
        </th>

        {/* 状态列 */}
        <th className="px-6 py-4 relative">
          <div className="flex items-center gap-2">
            <span
              onClick={() => onSort("status")}
              className="cursor-pointer hover:text-gray-700"
            >
              状态 <SortIndicator field="status" sortConfig={sortConfig} />
            </span>
            <FilterDropdown isActive={filterConfig.statusList.length > 0}>
              <div
                className={`px-4 py-2 text-xs cursor-pointer hover:bg-gray-50 flex justify-between items-center ${filterConfig.statusList.length === 0 ? "text-blue-600 font-bold" : "text-gray-700"}`}
                onClick={() =>
                  onFilterChange({ ...filterConfig, statusList: [] })
                }
              >
                全部显示{" "}
                {filterConfig.statusList.length === 0 && (
                  <FontAwesomeIcon icon={faCheck} />
                )}
              </div>
              {STATUS_OPTIONS.map((s) => (
                <div
                  key={s}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center text-gray-700 text-[11px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newList = filterConfig.statusList.includes(s)
                      ? filterConfig.statusList.filter((i) => i !== s)
                      : [...filterConfig.statusList, s];
                    onFilterChange({ ...filterConfig, statusList: newList });
                  }}
                >
                  {s}{" "}
                  {filterConfig.statusList.includes(s) && (
                    <FontAwesomeIcon icon={faCheck} className="text-blue-600" />
                  )}
                </div>
              ))}
            </FilterDropdown>
          </div>
        </th>

        {/* 所有者列 */}
        <th className="bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faWallet} className="opacity-30" />
            {/* 🚀 修改：移除 onClick 和 SortIndicator */}
            <span className="text-gray-500">所有者</span>
            <button
              onClick={() =>
                isConnected &&
                onFilterChange({
                  ...filterConfig,
                  onlyMe: !filterConfig.onlyMe,
                })
              }
              className={`w-6 h-6 rounded flex items-center justify-center transition-all ${filterConfig.onlyMe ? "bg-blue-100 text-blue-600 shadow-inner" : "text-gray-300 hover:text-blue-400"}`}
              title={isConnected ? "仅显示我的域名" : "请先连接钱包"}
            >
              <FontAwesomeIcon icon={faUser} size="sm" />
            </button>
          </div>
        </th>

        <th className="px-6 py-4">元数据</th>
        <th className="px-6 py-4">相关信息</th>

        {/* 操作列 */}
        <th className="px-6 py-4 text-right relative last:rounded-tr-xl">
          <div className="flex items-center justify-end gap-2">
            <span>操作</span>
            <FilterDropdown
              isActive={filterConfig.actionType !== "all"}
              menuWidth="w-32 right-0"
            >
              {(["all", "register", "renew"] as const).map((type) => (
                <div
                  key={type}
                  className={`px-4 py-2 text-[11px] hover:bg-gray-50 cursor-pointer ${filterConfig.actionType === type ? "text-blue-600 font-bold bg-blue-50/30" : "text-gray-600"}`}
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
        </th>

        {showDelete && <th className="px-6 py-4 text-center">删除</th>}
      </tr>
    </thead>
  );
};
