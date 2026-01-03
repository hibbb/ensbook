// src/components/NameTable/headers/NameHeader.tsx

import {
  faSortAlphaDown,
  faSortAlphaUp,
  faCheck,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThWrapper } from "./ThWrapper";
import { SortButton } from "./SortButton";
import { FilterDropdown } from "../FilterDropdown";
import type { SortConfig, SortField, FilterConfig } from "../types";
import { Tooltip } from "../../ui/Tooltip";

interface NameHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  nameCounts?: {
    lengthCounts: Record<number, number>;
    availableLengths: number[];
    wrappedCounts: { all: number; wrapped: number; unwrapped: number };
    // 🚀 新增字段
    notesCount?: number;
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
    notesCount: 0,
  },
}: NameHeaderProps) => {
  const isActive =
    filterConfig.lengthList.length > 0 || filterConfig.wrappedType !== "all";

  const totalLengthCount = Object.values(nameCounts.lengthCounts).reduce(
    (a, b) => a + b,
    0,
  );

  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";
  const buttonActiveClass = "bg-link text-white hover:bg-link-hover";
  const buttonInactiveClass = "text-link hover:bg-gray-50";

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

          {/* 🚀 更新 Tooltip 内容，显示数量 */}
          <Tooltip
            content={
              filterConfig.onlyWithNotes
                ? "显示所有名称"
                : `仅显示有备注的 (${nameCounts.notesCount || 0}) 个`
            }
          >
            <button
              onClick={() =>
                onFilterChange({
                  ...filterConfig,
                  onlyWithNotes: !filterConfig.onlyWithNotes,
                })
              }
              className={`${buttonBaseClass} ${
                filterConfig.onlyWithNotes
                  ? buttonActiveClass
                  : buttonInactiveClass
              }`}
            >
              <FontAwesomeIcon icon={faCommentDots} size="sm" />
            </button>
          </Tooltip>

          <FilterDropdown
            isActive={isActive}
            menuWidth="w-48"
            title="按长度或包装筛选"
          >
            {/* 1. 长度筛选 */}
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              按长度
            </div>

            {/* 全部长度 */}
            <div
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 flex justify-between items-center transition-colors ${
                filterConfig.lengthList.length === 0
                  ? "text-link font-bold"
                  : "text-gray-500"
              }`}
              onClick={() =>
                onFilterChange({ ...filterConfig, lengthList: [] })
              }
            >
              <span>全部长度</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-normal">
                  ({totalLengthCount})
                </span>
                {filterConfig.lengthList.length === 0 && (
                  <FontAwesomeIcon icon={faCheck} />
                )}
              </div>
            </div>

            {/* 长度列表 */}
            {nameCounts.availableLengths.map((len) => {
              const count = nameCounts.lengthCounts[len] || 0;
              const isSelected = filterConfig.lengthList.includes(len);
              const isDisabled = count === 0 && !isSelected;

              return (
                <div
                  key={len}
                  className={`px-4 py-2 text-sm flex justify-between items-center transition-colors
                    ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                        : "cursor-pointer hover:bg-gray-200"
                    }
                    ${isSelected ? "text-link font-bold" : "text-gray-500"}
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

            <div className="h-px bg-gray-100 my-1 mx-2" />

            {/* 2. 包装状态 */}
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
                  className={`px-4 py-2 text-sm flex justify-between items-center transition-colors
                    ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                        : "cursor-pointer hover:bg-gray-200"
                    }
                    ${isSelected ? "text-link font-bold" : "text-gray-500"}
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
