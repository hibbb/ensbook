// src/components/NameTable/headers/StatusHeader.tsx

import {
  faSortAmountDown,
  faSortAmountUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThWrapper } from "./ThWrapper";
import { SortButton } from "./SortButton";
import { FilterDropdown } from "../FilterDropdown";
import {
  STATUS_OPTIONS,
  type SortConfig,
  type SortField,
  type FilterConfig,
} from "../types";
import {
  STATUS_COLOR_BG_HOVER,
  STATUS_COLOR_TEXT,
} from "../../../config/constants";

interface StatusHeaderProps {
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  onSort: (field: SortField) => void;
  onFilterChange: (config: FilterConfig) => void;
  statusCounts?: Record<string, number>;
}

export const StatusHeader = ({
  sortConfig,
  filterConfig,
  onSort,
  onFilterChange,
  statusCounts = {},
}: StatusHeaderProps) => {
  // 🚀 计算总数用于“全部显示”
  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <ThWrapper>
      <div className="flex items-center gap-2">
        <span>状态</span>
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
          <SortButton
            field="status"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAmountDown}
            ascIcon={faSortAmountUp}
            descIcon={faSortAmountDown}
            title="按过期时间排序"
          />

          <FilterDropdown
            isActive={filterConfig.statusList.length > 0}
            title="按状态筛选"
          >
            {/* 全部显示选项 */}
            <div
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 flex justify-between items-center transition-colors ${
                filterConfig.statusList.length === 0
                  ? "text-link font-bold"
                  : "text-gray-500"
              }`}
              onClick={() =>
                onFilterChange({ ...filterConfig, statusList: [] })
              }
            >
              <span>全部显示</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-normal">
                  ({totalCount})
                </span>
                {filterConfig.statusList.length === 0 && (
                  <FontAwesomeIcon icon={faCheck} />
                )}
              </div>
            </div>

            {/* 状态列表 */}
            {STATUS_OPTIONS.map((s) => {
              const count = statusCounts[s] || 0;
              const isSelected = filterConfig.statusList.includes(s);
              const isDisabled = count === 0 && !isSelected;

              return (
                <div
                  key={s}
                  className={`
                    px-4 py-2 text-sm flex justify-between items-center transition-colors
                    ${STATUS_COLOR_TEXT[s]}
                    ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                        : `cursor-pointer ${STATUS_COLOR_BG_HOVER[s]}`
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isDisabled) return;
                    const newList = isSelected
                      ? filterConfig.statusList.filter((i) => i !== s)
                      : [...filterConfig.statusList, s];
                    onFilterChange({
                      ...filterConfig,
                      statusList: newList,
                    });
                  }}
                >
                  <span>{s}</span>
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
