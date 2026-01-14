// src/components/NameTable/headers/IndexHeader.tsx

import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { ThWrapper } from "./ThWrapper";
import { FilterDropdown } from "../FilterDropdown";
import { LEVEL_OPTIONS } from "../types";
import type { FilterConfig } from "../types";

interface IndexHeaderProps {
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  levelCounts: Record<number, number>;
}

export const IndexHeader = ({
  filterConfig,
  onFilterChange,
  levelCounts,
}: IndexHeaderProps) => {
  const { levelList } = filterConfig;
  const { t } = useTranslation();

  return (
    <ThWrapper className="justify-center">
      <FilterDropdown
        isActive={levelList.length > 0}
        title={t("table.filter.filter_level")}
        menuWidth="w-40"
        align="start"
      >
        <div
          className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 flex justify-between items-center transition-colors ${
            levelList.length === 0 ? "text-link font-bold" : "text-gray-500"
          }`}
          onClick={() => onFilterChange({ ...filterConfig, levelList: [] })}
        >
          <span>{t("table.filter.all_show")}</span>
          {levelList.length === 0 && <FontAwesomeIcon icon={faCheck} />}
        </div>

        <div className="h-px bg-gray-100 my-1 mx-2" />

        {LEVEL_OPTIONS.map((opt) => {
          const count = levelCounts[opt.value] || 0;
          const isSelected = levelList.includes(opt.value);
          const isDisabled = count === 0 && !isSelected;

          const dotColor =
            opt.value === 0
              ? "bg-gray-200"
              : opt.value === 1
                ? "bg-blue-400"
                : opt.value === 2
                  ? "bg-yellow-400"
                  : "bg-red-400";

          return (
            <div
              key={opt.value}
              className={`
                px-4 py-2 text-sm flex justify-between items-center transition-colors
                ${
                  isDisabled
                    ? "opacity-40 cursor-not-allowed bg-gray-50"
                    : "cursor-pointer hover:bg-gray-50"
                }
                ${isSelected ? "text-link font-qs-bold" : "text-text-main"}
              `}
              onClick={(e) => {
                e.stopPropagation();
                if (isDisabled) return;
                const newList = isSelected
                  ? levelList.filter((l) => l !== opt.value)
                  : [...levelList, opt.value];
                onFilterChange({ ...filterConfig, levelList: newList });
              }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                <span>{t(`table.filter.level_options.${opt.value}`)}</span>
              </div>

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
    </ThWrapper>
  );
};
