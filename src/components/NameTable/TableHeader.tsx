// src/components/NameTable/TableHeader.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faSortAmountDown,
  faSortAmountUp,
  faSortAlphaDown,
  faSortAlphaUp,
  faUser,
  faCheck,
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
  isAllSelected?: boolean;
  onToggleSelectAll?: () => void;
  hasRecords?: boolean;
}

const ThWrapper = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`h-full flex items-center text-sm font-qs-semibold font-normal text-text-main uppercase tracking-wider ${className}`}
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
  isAllSelected,
  onToggleSelectAll,
  hasRecords,
}: TableHeaderProps) => {
  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";
  const buttonActiveClass = "bg-link text-white hover:bg-link-hover";
  const buttonInactiveClass = "text-link hover:bg-gray-50";

  const getSortButtonProps = (
    field: SortField,
    defaultIcon: IconDefinition,
    ascIcon: IconDefinition,
    descIcon: IconDefinition,
  ) => {
    const isActive =
      sortConfig.field === field && sortConfig.direction !== null;

    const isAsc = isActive && sortConfig.direction === "asc";
    const isDesc = isActive && sortConfig.direction === "desc";

    return {
      className: `${buttonBaseClass} ${isActive ? buttonActiveClass : buttonInactiveClass}`,
      icon: isAsc ? ascIcon : isDesc ? descIcon : defaultIcon,
    };
  };

  return (
    <thead className="sticky top-0 z-20 bg-table-header backdrop-blur-sm">
      <tr className="text-left">
        {/* 1. 序号列 (居中) */}
        <th className="w-14">
          <ThWrapper className="justify-center">#</ThWrapper>
        </th>

        {/* 2. 名称列 (左对齐) */}
        <th>
          <ThWrapper>
            <div className="flex items-center gap-2">
              <span>名称</span>
              <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
                {(() => {
                  const props = getSortButtonProps(
                    "label",
                    faSortAlphaDown,
                    faSortAlphaDown,
                    faSortAlphaUp,
                  );
                  return (
                    <button
                      onClick={() => onSort("label")}
                      className={props.className}
                      title="按名称字母排序"
                    >
                      <FontAwesomeIcon icon={props.icon} size="sm" />
                    </button>
                  );
                })()}
                {(() => {
                  const props = getSortButtonProps(
                    "length",
                    faSortAmountDown,
                    faSortAmountUp,
                    faSortAmountDown,
                  );
                  return (
                    <button
                      onClick={() => onSort("length")}
                      className={props.className}
                      title="按长度排序"
                    >
                      <FontAwesomeIcon icon={props.icon} size="sm" />
                    </button>
                  );
                })()}
              </div>
            </div>
          </ThWrapper>
        </th>

        {/* 3. 状态列 (左对齐) */}
        <th>
          <ThWrapper>
            <div className="flex items-center gap-2">
              <span>状态</span>
              <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
                {(() => {
                  const props = getSortButtonProps(
                    "status",
                    faSortAmountDown,
                    faSortAmountUp,
                    faSortAmountDown,
                  );
                  return (
                    <button
                      onClick={() => onSort("status")}
                      className={props.className}
                      title="按过期时间排序"
                    >
                      <FontAwesomeIcon icon={props.icon} size="sm" />
                    </button>
                  );
                })()}
                <FilterDropdown isActive={filterConfig.statusList.length > 0}>
                  <div
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${filterConfig.statusList.length === 0 ? "text-link" : "text-gray-500"}`}
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
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center text-text-main text-[11px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newList = filterConfig.statusList.includes(s)
                          ? filterConfig.statusList.filter((i) => i !== s)
                          : [...filterConfig.statusList, s];
                        onFilterChange({
                          ...filterConfig,
                          statusList: newList,
                        });
                      }}
                    >
                      {s}
                      {filterConfig.statusList.includes(s) && (
                        <FontAwesomeIcon icon={faCheck} className="text-link" />
                      )}
                    </div>
                  ))}
                </FilterDropdown>
              </div>
            </div>
          </ThWrapper>
        </th>

        {/* 4. 所有者列 (左对齐) */}
        <th>
          <ThWrapper>
            <div className="flex items-center gap-2">
              <span>所有者</span>
              <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
                {(() => {
                  const props = getSortButtonProps(
                    "owner",
                    faSortAlphaDown,
                    faSortAlphaDown,
                    faSortAlphaUp,
                  );
                  return (
                    <button
                      onClick={() => onSort("owner")}
                      className={props.className}
                      title="按所有者排序"
                    >
                      <FontAwesomeIcon icon={props.icon} size="sm" />
                    </button>
                  );
                })()}
                <button
                  onClick={() =>
                    isConnected &&
                    onFilterChange({
                      ...filterConfig,
                      onlyMe: !filterConfig.onlyMe,
                    })
                  }
                  className={`${buttonBaseClass} ${
                    !isConnected
                      ? "cursor-not-allowed opacity-50 text-gray-300"
                      : filterConfig.onlyMe
                        ? buttonActiveClass
                        : buttonInactiveClass
                  }`}
                  title={isConnected ? "仅显示我的" : "请先连接钱包"}
                >
                  <FontAwesomeIcon icon={faUser} size="xs" />
                </button>
              </div>
            </div>
          </ThWrapper>
        </th>

        {/* 5. 信息列 (修改：左对齐，移除 justify-center) */}
        <th>
          <ThWrapper>信息</ThWrapper>
        </th>

        {/* 6. 操作列 (修改：左对齐，复选框和下拉菜单自然排列) */}
        <th>
          <ThWrapper>
            <div className="flex items-center gap-2">
              {/* 全选复选框 */}
              {onToggleSelectAll && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    disabled={!hasRecords || !isConnected}
                    className={`w-4 h-4 rounded border-gray-400 text-link focus:ring-link/20 transition-all ${
                      !hasRecords || !isConnected
                        ? "cursor-not-allowed bg-gray-200"
                        : "cursor-pointer"
                    }`}
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    title={!isConnected ? "请先连接钱包" : "全选当前页"}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <span>操作</span>
                <FilterDropdown
                  isActive={filterConfig.actionType !== "all"}
                  menuWidth="w-32 right-0"
                >
                  {(["all", "register", "renew"] as const).map((type) => (
                    <div
                      key={type}
                      className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${filterConfig.actionType === type ? "text-link bg-blue-50/50" : "text-gray-500"}`}
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
            </div>
          </ThWrapper>
        </th>

        {/* 7. 删除列 (居中) */}
        <th className="text-center">
          <ThWrapper className="justify-center">删除</ThWrapper>
        </th>
      </tr>
    </thead>
  );
};
