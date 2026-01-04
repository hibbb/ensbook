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
    memosCount?: number;
  };
  disabled?: boolean;
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
    memosCount: 0,
  },
  disabled,
}: NameHeaderProps) => {
  const isActive =
    filterConfig.lengthList.length > 0 || filterConfig.wrappedType !== "all";

  const totalLengthCount = Object.values(nameCounts.lengthCounts).reduce(
    (a, b) => a + b,
    0,
  );

  const memosCount = nameCounts.memosCount || 0;
  // 当前视图下的总数
  const totalCount = nameCounts.wrappedCounts.all;

  const isNoMemos = memosCount === 0;
  const isAllMemos = totalCount > 0 && memosCount === totalCount;

  // 🚀 修复 Bug：
  // 只有在 "所有都有备注" 且 "当前并未开启筛选" 时才禁用。
  // 如果当前 filterConfig.onlyWithMemos 为 true，按钮必须保持可用，以便用户取消筛选。
  const isDisabled =
    disabled || isNoMemos || (isAllMemos && !filterConfig.onlyWithMemos);

  // 🚀 同步修复 Tooltip 逻辑
  let tooltipContent = "";
  if (isNoMemos) {
    tooltipContent = "没有任何备注";
  } else if (isAllMemos && !filterConfig.onlyWithMemos) {
    // 只有在未筛选状态下，才提示"全都有备注"
    tooltipContent = "所有名称都进行了备注";
  } else {
    tooltipContent = filterConfig.onlyWithMemos
      ? "显示所有名称" // 激活状态下提示取消
      : `仅显示有备注的 (${memosCount}) 个`;
  }

  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";

  let buttonClass = "";
  if (isDisabled) {
    buttonClass = "text-gray-300 cursor-not-allowed bg-transparent";
  } else if (filterConfig.onlyWithMemos) {
    buttonClass = "bg-link text-white hover:bg-link-hover";
  } else {
    buttonClass = "text-link hover:bg-gray-50";
  }

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
            disabled={disabled}
          />

          <Tooltip content={tooltipContent}>
            <button
              disabled={isDisabled}
              onClick={() =>
                !isDisabled &&
                onFilterChange({
                  ...filterConfig,
                  onlyWithMemos: !filterConfig.onlyWithMemos,
                })
              }
              className={`${buttonBaseClass} ${buttonClass}`}
            >
              <FontAwesomeIcon icon={faCommentDots} size="sm" />
            </button>
          </Tooltip>

          <FilterDropdown
            isActive={isActive}
            menuWidth="w-48"
            title="按长度或包装筛选"
            disabled={disabled}
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
              const isDisabledOption = count === 0 && !isSelected;

              return (
                <div
                  key={len}
                  className={`px-4 py-2 text-sm flex justify-between items-center transition-colors
                    ${
                      isDisabledOption
                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                        : "cursor-pointer hover:bg-gray-200"
                    }
                    ${isSelected ? "text-link font-bold" : "text-gray-500"}
                  `}
                  onClick={() => {
                    if (isDisabledOption) return;
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
              const isDisabledOption = type !== "all" && count === 0;

              return (
                <div
                  key={type}
                  className={`px-4 py-2 text-sm flex justify-between items-center transition-colors
                    ${
                      isDisabledOption
                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                        : "cursor-pointer hover:bg-gray-200"
                    }
                    ${isSelected ? "text-link font-bold" : "text-gray-500"}
                  `}
                  onClick={() => {
                    if (!isDisabledOption)
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
