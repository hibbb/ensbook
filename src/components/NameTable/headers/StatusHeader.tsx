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
  statusCounts?: Record<string, number>; // 🚀 新增
}

export const StatusHeader = ({
  sortConfig,
  filterConfig,
  onSort,
  onFilterChange,
  statusCounts = {},
}: StatusHeaderProps) => {
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

          <FilterDropdown isActive={filterConfig.statusList.length > 0}>
            <div
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 flex justify-between items-center ${
                filterConfig.statusList.length === 0
                  ? "text-link"
                  : "text-gray-500"
              }`}
              onClick={() =>
                onFilterChange({ ...filterConfig, statusList: [] })
              }
            >
              全部显示
              {filterConfig.statusList.length === 0 && (
                <FontAwesomeIcon icon={faCheck} />
              )}
            </div>
            {STATUS_OPTIONS.map((s) => {
              const count = statusCounts[s] || 0;
              const isSelected = filterConfig.statusList.includes(s);
              const isDisabled = count === 0 && !isSelected; // 如果未选中且数量为0，则视为禁用态

              return (
                <div
                  key={s}
                  className={`
                    px-4 py-2 text-sm flex justify-between items-center transition-colors
                    ${STATUS_COLOR_TEXT[s]}
                    ${isDisabled ? "opacity-40 cursor-not-allowed bg-gray-50" : `cursor-pointer ${STATUS_COLOR_BG_HOVER[s]}`}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isDisabled) return; // 阻止 0 数量的点击

                    const newList = isSelected
                      ? filterConfig.statusList.filter((i) => i !== s)
                      : [...filterConfig.statusList, s];
                    onFilterChange({
                      ...filterConfig,
                      statusList: newList,
                    });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{s}</span>
                    {/* 显示数量 */}
                    <span
                      className={`text-xs ${isDisabled ? "text-gray-300" : "text-gray-400 font-qs-regular"}`}
                    >
                      ({count})
                    </span>
                  </div>

                  {isSelected && (
                    <FontAwesomeIcon icon={faCheck} className="text-link" />
                  )}
                </div>
              );
            })}
          </FilterDropdown>
        </div>
      </div>
    </ThWrapper>
  );
};
