// src/components/NameTable/headers/ActionHeader.tsx

import { ThWrapper } from "./ThWrapper";
import { FilterDropdown } from "../FilterDropdown";
import type { FilterConfig } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "../../ui/Tooltip"; // 🚀 引入 Tooltip

interface ActionHeaderProps {
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  isConnected: boolean;
  isAllSelected?: boolean;
  hasRenewable?: boolean;
  onToggleSelectAll?: () => void;
  actionCounts?: { all: number; register: number; renew: number };
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
            {/* 🚀 使用 Tooltip 包裹 */}
            <Tooltip
              content={
                !isConnected
                  ? "请先连接钱包"
                  : !hasRenewable
                    ? "无可续费域名"
                    : "全选可续费域名"
              }
            >
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
                // ❌ 移除 title
              />
            </Tooltip>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span>操作</span>
          <FilterDropdown
            isActive={filterConfig.actionType !== "all"}
            menuWidth="w-40 right-0"
            title="按操作类型筛选"
          >
            {(["all", "register", "renew"] as const).map((type) => {
              const count = actionCounts[type];
              const isSelected = filterConfig.actionType === type;
              const isDisabled = type !== "all" && count === 0;

              return (
                <div
                  key={type}
                  className={`
                    px-4 py-2 text-sm flex justify-between items-center transition-colors
                    ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed text-gray-400 bg-gray-50"
                        : "cursor-pointer hover:bg-gray-200"
                    }
                    ${isSelected ? "text-link font-bold" : "text-gray-500"}
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-qs-regular">
                      ({count})
                    </span>
                    {isSelected && (
                      <FontAwesomeIcon icon={faCheck} className="text-link" />
                    )}
                  </div>
                </div>
              );
            })}
          </FilterDropdown>
        </div>
      </div>
    </ThWrapper>
  );
};
