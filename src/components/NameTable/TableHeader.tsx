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
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { FilterDropdown } from "./FilterDropdown";
import {
  STATUS_OPTIONS,
  type SortField,
  type SortConfig,
  type FilterConfig,
} from "./types";
import {
  STATUS_COLOR_BG_HOVER,
  STATUS_COLOR_TEXT,
} from "../../config/constants";

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  isConnected: boolean;
  showDelete?: boolean;
  isAllSelected?: boolean;
  onToggleSelectAll?: () => void;
  hasRenewable?: boolean;
  hasRecords?: boolean;
  topOffset?: string | number;
  // 🚀 1. 更新接口定义
  onBatchDelete?: (status?: string) => void;
  uniqueStatuses?: string[]; // 接收计算好的状态列表
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
  hasRenewable,
  showDelete,
  topOffset = 0,
  onBatchDelete, // 🚀 2. 解构新 props
  uniqueStatuses = [],
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

  // 🚀 修复：设置 CSS 变量，供 Tailwind 类使用
  const headerStyle = {
    "--header-offset":
      typeof topOffset === "number" ? `${topOffset}px` : topOffset,
  } as React.CSSProperties;

  return (
    <thead
      // 🚀 修复：移动端默认 top-0，桌面端 (lg) 使用传入的 offset
      className="sticky top-0 z-20 bg-table-header backdrop-blur-sm transition-all duration-300 lg:top-[var(--header-offset)]"
      style={headerStyle}
    >
      <tr className="text-left">
        <th className="w-14">
          <ThWrapper className="justify-center">#</ThWrapper>
        </th>
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
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 flex justify-between items-center ${filterConfig.statusList.length === 0 ? "text-link" : "text-gray-500"}`}
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
                      className={`px-4 py-2 ${STATUS_COLOR_TEXT[s]} ${STATUS_COLOR_BG_HOVER[s]} cursor-pointer flex justify-between items-center text-sm`}
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
        <th>
          <ThWrapper>信息</ThWrapper>
        </th>
        <th>
          <ThWrapper>
            <div className="flex items-center gap-2">
              {onToggleSelectAll && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    disabled={!isConnected || !hasRenewable}
                    className={`w-4 h-4 rounded border-gray-400 text-link focus:ring-link/20 transition-all ${
                      !isConnected || !hasRenewable
                        ? "cursor-not-allowed bg-gray-200"
                        : "cursor-pointer"
                    }`}
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    title={
                      !isConnected
                        ? "请先连接钱包"
                        : !hasRenewable
                          ? "无可续费域名"
                          : "全选可续费域名"
                    }
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
                      className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${filterConfig.actionType === type ? "text-link bg-blue-50/50" : "text-gray-500"}`}
                      onClick={() =>
                        onFilterChange({ ...filterConfig, actionType: type })
                      }
                    >
                      {type === "all"
                        ? "全部显示"
                        : type === "register"
                          ? "可注册"
                          : "可续费"}
                    </div>
                  ))}
                </FilterDropdown>
              </div>
            </div>
          </ThWrapper>
        </th>
        {/* 7. 删除列 - 改造为悬停下拉菜单 */}
        <th className="text-center w-14 relative">
          <ThWrapper className="justify-center">
            {/* 使用 group/delete 控制下拉菜单的显示
                      只有当 showDelete 为 true 时才启用交互
                    */}
            <div className={`relative ${showDelete ? "group/delete" : ""}`}>
              {/* 触发器：垃圾桶图标 */}
              <button
                disabled={!showDelete}
                className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 ${
                  showDelete
                    ? "text-link hover:bg-gray-50 cursor-pointer" // 默认灰色，悬停变红
                    : "text-gray-300 cursor-not-allowed opacity-50"
                }`}
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>

              {/* 下拉菜单：悬停时显示 */}
              {showDelete && onBatchDelete && (
                <div className="absolute right-0 top-full mt-2 w-32 text-sm font-qs-regular bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 opacity-0 invisible group-hover/delete:opacity-100 group-hover/delete:visible transition-all duration-200 transform origin-top-right">
                  {/* 列表项：按状态删除 */}
                  {uniqueStatuses.length > 0 && (
                    <>
                      {uniqueStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => onBatchDelete(status)}
                          className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between group/item ${STATUS_COLOR_TEXT[status]} ${STATUS_COLOR_BG_HOVER[status]}`}
                        >
                          <span>{status}</span>
                          {/* 悬停时显示小垃圾桶图标增强暗示 */}
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                          />
                        </button>
                      ))}
                      <div className="h-px bg-gray-100 my-1" />
                    </>
                  )}

                  {/* 列表项：全部删除 */}
                  <button
                    onClick={() => onBatchDelete()} // 不传参表示全部删除
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <span>全部清空</span>
                  </button>
                </div>
              )}
            </div>
          </ThWrapper>
        </th>
      </tr>
    </thead>
  );
};
