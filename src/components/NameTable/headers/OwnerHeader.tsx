// src/components/NameTable/headers/OwnerHeader.tsx

import {
  faSortAlphaDown,
  faSortAlphaUp,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next"; // 🚀
import { ThWrapper } from "./ThWrapper";
import { SortButton } from "./SortButton";
import type { SortConfig, SortField, FilterConfig } from "../types";
import { Tooltip } from "../../ui/Tooltip";

interface OwnerHeaderProps {
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  isConnected: boolean;
  onSort: (field: SortField) => void;
  onFilterChange: (config: FilterConfig) => void;
  myCount?: number;
  listCount?: number;
  disabled?: boolean;
}

export const OwnerHeader = ({
  sortConfig,
  filterConfig,
  isConnected,
  onSort,
  onFilterChange,
  myCount = 0,
  listCount = 0,
  disabled,
}: OwnerHeaderProps) => {
  const { t } = useTranslation(); // 🚀
  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";
  const buttonActiveClass = "bg-link text-white hover:bg-link-hover";
  const buttonInactiveClass = "text-link hover:bg-gray-50";

  const isAllMine = listCount > 0 && myCount === listCount;

  const isDisabled =
    disabled ||
    !isConnected ||
    myCount === 0 ||
    (isAllMine && !filterConfig.onlyMe);

  const getTooltipContent = () => {
    if (!isConnected) return t("table.filter.connect_wallet");
    if (myCount === 0) return t("table.filter.no_mine");

    if (filterConfig.onlyMe) return t("table.filter.show_all");

    if (isAllMine) return t("table.filter.all_mine");

    return t("table.filter.only_mine", { count: myCount });
  };

  return (
    <ThWrapper>
      <div className="flex items-center gap-2">
        <span>{t("table.header.owner")}</span>
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
          <SortButton
            field="owner"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAlphaDown}
            ascIcon={faSortAlphaDown}
            descIcon={faSortAlphaUp}
            title={t("table.filter.sort_owner")}
            disabled={disabled}
          />

          <Tooltip content={getTooltipContent()}>
            <button
              disabled={isDisabled}
              onClick={() =>
                !isDisabled &&
                onFilterChange({
                  ...filterConfig,
                  onlyMe: !filterConfig.onlyMe,
                })
              }
              className={`${buttonBaseClass} ${
                isDisabled
                  ? "cursor-not-allowed text-gray-300"
                  : filterConfig.onlyMe
                    ? buttonActiveClass
                    : buttonInactiveClass
              }`}
            >
              <FontAwesomeIcon icon={faCircleUser} size="sm" />
            </button>
          </Tooltip>
        </div>
      </div>
    </ThWrapper>
  );
};
