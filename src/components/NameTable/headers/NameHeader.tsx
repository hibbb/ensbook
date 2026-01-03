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
    notesCount?: number;
  };
  disabled?: boolean; // 🚀 新增
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
  disabled, // 🚀 解构
}: NameHeaderProps) => {
  const isActive =
    filterConfig.lengthList.length > 0 || filterConfig.wrappedType !== "all";

  const totalLengthCount = Object.values(nameCounts.lengthCounts).reduce(
    (a, b) => a + b,
    0,
  );

  // 🚀 1. 计算逻辑状态
  const notesCount = nameCounts.notesCount || 0;
  // 使用 wrappedCounts.all 作为当前上下文的总数 (因为它包含了 wrapped + unwrapped 的总和)
  const totalCount = nameCounts.wrappedCounts.all;

  const isNoNotes = notesCount === 0;
  const isAllNotes = totalCount > 0 && notesCount === totalCount;

  // 只要满足“全无”或“全有”，且当前没有处于“仅显示备注”的筛选状态下，就禁用
  // (注意：如果用户已经在筛选状态下，即使 notesCount 为 0，也应该允许他点击以取消筛选，防止死锁。
  // 但根据你的需求描述，我们优先满足禁用逻辑。如果处于筛选状态且数量为0，列表为空，用户通常会重置过滤器)
  // 🚀 逻辑合并：原有的业务禁用逻辑 || 全局禁用
  const isDisabled = disabled || isNoNotes || isAllNotes;

  // 🚀 2. 动态生成 Tooltip 文案
  let tooltipContent = "";
  if (isNoNotes) {
    tooltipContent = "没有任何备注";
  } else if (isAllNotes) {
    tooltipContent = "所有名称都进行了备注";
  } else {
    tooltipContent = filterConfig.onlyWithNotes
      ? "显示所有名称"
      : `仅显示有备注的 (${notesCount}) 个`;
  }

  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";

  // 🚀 3. 动态生成样式
  let buttonClass = "";
  if (isDisabled) {
    buttonClass = "text-gray-300 cursor-not-allowed bg-transparent";
  } else if (filterConfig.onlyWithNotes) {
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
            disabled={disabled} // 🚀 传参
          />

          {/* 🚀 4. 应用新的 Tooltip 和 Button 逻辑 */}
          <Tooltip content={tooltipContent}>
            <button
              disabled={isDisabled}
              onClick={() =>
                !isDisabled &&
                onFilterChange({
                  ...filterConfig,
                  onlyWithNotes: !filterConfig.onlyWithNotes,
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
            disabled={disabled} // 🚀 传参
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
