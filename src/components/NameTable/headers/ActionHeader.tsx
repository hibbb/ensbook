// src/components/NameTable/headers/ActionHeader.tsx

import { ThWrapper } from "./ThWrapper";
import { FilterDropdown } from "../FilterDropdown";
import type { FilterConfig } from "../types";

interface ActionHeaderProps {
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  isConnected: boolean;
  isAllSelected?: boolean;
  hasRenewable?: boolean;
  onToggleSelectAll?: () => void;
  actionCounts?: { all: number; register: number; renew: number }; // 🚀 新增
}

export const ActionHeader = ({
  filterConfig,
  onFilterChange,
  isConnected,
  isAllSelected,
  hasRenewable,
  onToggleSelectAll,
  actionCounts = { all: 0, register: 0, renew: 0 },
}: ActionHeaderProps) => {
  return (
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
            menuWidth="w-36 right-0" // 稍微加宽一点适应数字
          >
            {(["all", "register", "renew"] as const).map((type) => {
              const count = actionCounts[type];
              const isSelected = filterConfig.actionType === type;
              // 0 数量时，如果是 'all' 且列表为空，或者其他选项，是否禁用？
              // 'all' 一般不禁用，其他如 register=0 可禁用
              const isDisabled = type !== "all" && count === 0;

              return (
                <div
                  key={type}
                  className={`
                    px-4 py-2 text-sm flex justify-between items-center
                    ${isDisabled ? "opacity-50 cursor-not-allowed text-gray-400 bg-gray-50" : "cursor-pointer hover:bg-gray-50"}
                    ${isSelected ? "text-link bg-blue-50/50" : !isDisabled ? "text-gray-500" : ""}
                  `}
                  onClick={() =>
                    !isDisabled &&
                    onFilterChange({ ...filterConfig, actionType: type })
                  }
                >
                  <span>
                    {type === "all"
                      ? "全部显示"
                      : type === "register"
                        ? "可注册"
                        : "可续费"}
                  </span>
                  {/* 显示数量 */}
                  <span
                    className={`text-xs ml-2 ${isSelected ? "text-link/70" : "text-gray-300"}`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </FilterDropdown>
        </div>
      </div>
    </ThWrapper>
  );
};
