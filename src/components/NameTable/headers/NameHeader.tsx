// src/components/NameTable/headers/NameHeader.tsx

import {
  faSortAlphaDown,
  faSortAlphaUp,
  faCheck,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
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
    // 🟢 修复：将 number 改为 0
    wrappedCounts: { all: 0, wrapped: 0, unwrapped: 0 },
    memosCount: 0,
  },
  disabled,
}: NameHeaderProps) => {
  const { t } = useTranslation();
  const isActive =
    filterConfig.lengthList.length > 0 || filterConfig.wrappedType !== "all";

  const totalLengthCount = Object.values(nameCounts.lengthCounts).reduce(
    (a, b) => a + b,
    0,
  );

  const memosCount = nameCounts.memosCount || 0;
  const totalCount = nameCounts.wrappedCounts.all;

  const isNoMemos = memosCount === 0;
  const isAllMemos = totalCount > 0 && memosCount === totalCount;

  const isDisabled =
    disabled || isNoMemos || (isAllMemos && !filterConfig.onlyWithMemos);

  let tooltipContent = "";
  if (isNoMemos) {
    tooltipContent = t("table.filter.no_memos");
  } else if (isAllMemos && !filterConfig.onlyWithMemos) {
    tooltipContent = t("table.filter.all_memos");
  } else {
    tooltipContent = filterConfig.onlyWithMemos
      ? t("table.filter.show_all")
      : t("table.filter.only_memos", { count: memosCount });
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
            title={t("table.filter.filter_length_wrap")}
            disabled={disabled}
          >
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
