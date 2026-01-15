// src/components/NameTable/headers/NameHeader.tsx

import {
  faSortAlphaDown,
  faSortAlphaUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { ThWrapper } from "./ThWrapper";
import { SortButton } from "./SortButton";
import { FilterDropdown } from "../FilterDropdown";
import type { SortConfig, SortField, FilterConfig } from "../types";

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
    // 🚀 新增字段
    memoTotal?: number;
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
    memoTotal: 0,
  },
  disabled,
}: NameHeaderProps) => {
  const { t } = useTranslation();

  // 状态判断
  const isActive =
    filterConfig.lengthList.length > 0 ||
    filterConfig.wrappedType !== "all" ||
    filterConfig.memoFilter !== "all"; // 🚀

  const totalLengthCount = Object.values(nameCounts.lengthCounts).reduce(
    (a, b) => a + b,
    0,
  );

  // 🚀 获取正确的统计数据
  const memosCount = nameCounts.memosCount || 0;
  // 如果 memoTotal 没传，降级使用 wrappedCounts.all (虽然不太准，但防止崩溃)
  const totalCount = nameCounts.memoTotal ?? nameCounts.wrappedCounts.all;
  const noMemosCount = totalCount - memosCount;

  return (
    <ThWrapper>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span>{t("table.header.name")}</span>
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
          <SortButton
            field="label"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAlphaDown}
            ascIcon={faSortAlphaDown}
            descIcon={faSortAlphaUp}
            title={t("table.filter.sort_name")}
            disabled={disabled}
          />

          <FilterDropdown
            isActive={isActive}
            menuWidth="w-48"
            title={t("table.filter.filter_length_wrap")}
            disabled={disabled}
          >
            {/* --- Section 1: By Memo --- */}
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t("table.filter.by_memo")}
            </div>

            {/* Option: All Names */}
            <div
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 flex justify-between items-center transition-colors ${
                filterConfig.memoFilter === "all"
                  ? "text-link"
                  : "text-gray-500"
              }`}
              onClick={() =>
                onFilterChange({ ...filterConfig, memoFilter: "all" })
              }
            >
              <span>{t("table.filter.all_names")}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-normal">
                  ({totalCount})
                </span>
                {filterConfig.memoFilter === "all" && (
                  <FontAwesomeIcon icon={faCheck} />
                )}
              </div>
            </div>

            {/* Option: With Memo */}
            <div
              className={`px-4 py-2 text-sm flex justify-between items-center transition-colors
                ${
                  memosCount === 0 && filterConfig.memoFilter !== "with_memo"
                    ? "opacity-40 cursor-not-allowed bg-gray-50"
                    : "cursor-pointer hover:bg-gray-200"
                }
                ${filterConfig.memoFilter === "with_memo" ? "text-link" : "text-gray-500"}
              `}
              onClick={() => {
                // 如果数量为0且未被选中，则禁止点击
                if (memosCount > 0 || filterConfig.memoFilter === "with_memo") {
                  onFilterChange({ ...filterConfig, memoFilter: "with_memo" });
                }
              }}
            >
              <span>{t("table.filter.with_memo")}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-normal">
                  ({memosCount})
                </span>
                {filterConfig.memoFilter === "with_memo" && (
                  <FontAwesomeIcon icon={faCheck} />
                )}
              </div>
            </div>

            {/* 🚀 Option: No Memo (新增) */}
            <div
              className={`px-4 py-2 text-sm flex justify-between items-center transition-colors
                ${
                  noMemosCount === 0 && filterConfig.memoFilter !== "no_memo"
                    ? "opacity-40 cursor-not-allowed bg-gray-50"
                    : "cursor-pointer hover:bg-gray-200"
                }
                ${filterConfig.memoFilter === "no_memo" ? "text-link" : "text-gray-500"}
              `}
              onClick={() => {
                if (noMemosCount > 0 || filterConfig.memoFilter === "no_memo") {
                  onFilterChange({ ...filterConfig, memoFilter: "no_memo" });
                }
              }}
            >
              <span>{t("table.filter.no_memo")}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-normal">
                  ({noMemosCount})
                </span>
                {filterConfig.memoFilter === "no_memo" && (
                  <FontAwesomeIcon icon={faCheck} />
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 my-1 mx-2" />

            {/* --- Section 2: By Length (保持不变) --- */}
            {/* ... (省略中间代码) ... */}
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t("table.filter.by_length")}
            </div>

            <div
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 flex justify-between items-center transition-colors ${
                filterConfig.lengthList.length === 0
                  ? "text-link"
                  : "text-gray-500"
              }`}
              onClick={() =>
                onFilterChange({ ...filterConfig, lengthList: [] })
              }
            >
              <span>{t("table.filter.all_length")}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-normal">
                  ({totalLengthCount})
                </span>
                {filterConfig.lengthList.length === 0 && (
                  <FontAwesomeIcon icon={faCheck} />
                )}
              </div>
            </div>

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
                    ${isSelected ? "text-link" : "text-gray-500"}
                  `}
                  onClick={() => {
                    if (isDisabledOption) return;
                    const newList = isSelected
                      ? filterConfig.lengthList.filter((l) => l !== len)
                      : [...filterConfig.lengthList, len];
                    onFilterChange({ ...filterConfig, lengthList: newList });
                  }}
                >
                  <span>
                    {len} {t("table.filter.char")}
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

            <div className="h-px bg-gray-100 my-1 mx-2" />

            {/* --- Section 3: By Wrap (保持不变) --- */}
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t("table.filter.by_wrap")}
            </div>

            {(["all", "wrapped", "unwrapped"] as const).map((type) => {
              const count = nameCounts.wrappedCounts[type];
              const isSelected = filterConfig.wrappedType === type;
              const isDisabledOption = type !== "all" && count === 0;

              let label = "";
              if (type === "all") label = t("table.filter.all_states");
              else if (type === "wrapped") label = t("table.filter.wrapped");
              else label = t("table.filter.unwrapped");

              return (
                <div
                  key={type}
                  className={`px-4 py-2 text-sm flex justify-between items-center transition-colors
                    ${
                      isDisabledOption
                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                        : "cursor-pointer hover:bg-gray-200"
                    }
                    ${isSelected ? "text-link" : "text-gray-500"}
                  `}
                  onClick={() => {
                    if (!isDisabledOption)
                      onFilterChange({ ...filterConfig, wrappedType: type });
                  }}
                >
                  <span>{label}</span>
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
