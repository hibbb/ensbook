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
}

export const ActionHeader = ({
  filterConfig,
  onFilterChange,
  isConnected,
  isAllSelected,
  hasRenewable,
  onToggleSelectAll,
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
            menuWidth="w-32 right-0"
          >
            {(["all", "register", "renew"] as const).map((type) => (
              <div
                key={type}
                className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                  filterConfig.actionType === type
                    ? "text-link bg-blue-50/50"
                    : "text-gray-500"
                }`}
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
  );
};
