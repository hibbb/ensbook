// src/components/NameTable/headers/NameHeader.tsx

import {
  faSortAlphaDown,
  faSortAlphaUp,
  faSortAmountDown,
  faSortAmountUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThWrapper } from "./ThWrapper";
import { SortButton } from "./SortButton";
import { FilterDropdown } from "../FilterDropdown"; // 引入 Dropdown
import type { SortConfig, SortField, FilterConfig } from "../types";

interface NameHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  // 🚀 新增 Props
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  nameCounts?: {
    lengthCounts: Record<number, number>;
    availableLengths: number[];
    wrappedCounts: { all: number; wrapped: number; unwrapped: number };
  };
}

export const NameHeader = ({
  sortConfig,
  onSort,
  filterConfig,
  onFilterChange,
  nameCounts = {
    lengthCounts: {},
    availableLengths: [],
    wrappedCounts: { all: 0, wrapped: 0, unwrapped: 0 },
  },
}: NameHeaderProps) => {
  const isActive =
    filterConfig.lengthList.length > 0 || filterConfig.wrappedType !== "all";

  return (
    <ThWrapper>
      <div className="flex items-center gap-2">
        <span>名称</span>
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
          <SortButton
            field="label"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAlphaDown}
            ascIcon={faSortAlphaDown}
            descIcon={faSortAlphaUp}
            title="按名称字母排序"
          />
          <SortButton
            field="length"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAmountDown}
            ascIcon={faSortAmountUp}
            descIcon={faSortAmountDown}
            title="按长度排序"
          />

          {/* 🚀 新增筛选下拉框 */}
          <FilterDropdown isActive={isActive} menuWidth="w-48">
            {/* 1. 长度筛选部分 */}
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              按长度
            </div>

            {/* 全部长度 */}
            <div
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 flex justify-between items-center ${
                filterConfig.lengthList.length === 0
                  ? "text-link"
                  : "text-gray-500"
              }`}
              onClick={() =>
                onFilterChange({ ...filterConfig, lengthList: [] })
              }
            >
              <span>全部长度</span>
              {filterConfig.lengthList.length === 0 && (
                <FontAwesomeIcon icon={faCheck} />
              )}
            </div>

            {/* 长度列表 (动态生成) */}
            {nameCounts.availableLengths.map((len) => {
              const count = nameCounts.lengthCounts[len] || 0;
              const isSelected = filterConfig.lengthList.includes(len);
              const isDisabled = count === 0 && !isSelected;

              return (
                <div
                  key={len}
                  className={`px-4 py-2 text-sm flex justify-between items-center transition-colors
                    ${isDisabled ? "opacity-40 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:bg-gray-50"}
                    ${isSelected ? "text-link bg-blue-50/50" : "text-gray-500"}
                  `}
                  onClick={() => {
                    if (isDisabled) return;
                    const newList = isSelected
                      ? filterConfig.lengthList.filter((l) => l !== len)
                      : [...filterConfig.lengthList, len];
                    onFilterChange({ ...filterConfig, lengthList: newList });
                  }}
                >
                  <span>{len} 字符</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${isSelected ? "text-link/70" : "text-gray-300"}`}
                    >
                      ({count})
                    </span>
                    {isSelected && (
                      <FontAwesomeIcon icon={faCheck} className="text-link" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* 分割线 */}
            <div className="h-px bg-gray-100 my-1 mx-2" />

            {/* 2. 包装状态筛选部分 */}
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              按包装
            </div>

            {(["all", "wrapped", "unwrapped"] as const).map((type) => {
              const count = nameCounts.wrappedCounts[type];
              const isSelected = filterConfig.wrappedType === type;
              const isDisabled = type !== "all" && count === 0;

              return (
                <div
                  key={type}
                  className={`px-4 py-2 text-sm flex justify-between items-center
                    ${isDisabled ? "opacity-40 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:bg-gray-50"}
                    ${isSelected ? "text-link bg-blue-50/50" : "text-gray-500"}
                  `}
                  onClick={() => {
                    if (!isDisabled)
                      onFilterChange({ ...filterConfig, wrappedType: type });
                  }}
                >
                  <span>
                    {type === "all"
                      ? "全部状态"
                      : type === "wrapped"
                        ? "Wrapped"
                        : "Unwrapped"}
                  </span>
                  <span
                    className={`text-xs ${isSelected ? "text-link/70" : "text-gray-300"}`}
                  >
                    ({count})
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
