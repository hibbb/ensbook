// src/components/NameTable/headers/StatusHeader.tsx

import {
  faSortAmountDown,
  faSortAmountUp,
  faCheck,
  faClock,
  faRotateLeft,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
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
  disabled?: boolean;
}

export const StatusHeader = ({
  sortConfig,
  filterConfig,
  onSort,
  onFilterChange,
  statusCounts = {},
  disabled,
}: StatusHeaderProps) => {
  const { t } = useTranslation();
  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <ThWrapper>
      <div className="flex items-center gap-2 whitespace-nowrap">
        {/* 🚀 替换: table.header.status -> table.header.status (保持不变) */}
        <span>{t("table.header.status")}</span>
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
          <SortButton
            field="status"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAmountDown}
            ascIcon={faSortAmountUp}
            descIcon={faSortAmountDown}
            // 🚀 替换: table.filter.sort_status -> table.filter.sort_status (保持不变)
            title={t("table.filter.sort_status")}
            disabled={disabled}
          />

          <SortButton
            field="registered"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faClock}
            ascIcon={faRotateRight}
            descIcon={faRotateLeft}
            // 🚀 替换: table.filter.sort_reg_date -> table.filter.sort_reg_date (保持不变)
            title={t("table.filter.sort_reg_date")}
            disabled={disabled}
          />

          <FilterDropdown
            isActive={filterConfig.statusList.length > 0}
            // 🚀 替换: table.filter.filter_status -> table.filter.filter_status (保持不变)
            title={t("table.filter.filter_status")}
            disabled={disabled}
          >
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
              {/* 🚀 替换: table.filter.all_show -> table.filter.all_show (保持不变) */}
              <span>{t("table.filter.all_show")}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-normal">
                  ({totalCount})
                </span>
                {filterConfig.statusList.length === 0 && (
                  <FontAwesomeIcon icon={faCheck} />
                )}
              </div>
            </div>

            {STATUS_OPTIONS.map((s) => {
              const count = statusCounts[s] || 0;

              if (s === "Unknown" && count === 0) {
                return null;
              }

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
                  {/* 🚀 翻译状态 */}
                  <span>{t(`status.${s.toLowerCase()}`)}</span>
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
