// src/components/NameTable/headers/OwnerHeader.tsx

import {
  faSortAlphaDown,
  faSortAlphaUp,
} from "@fortawesome/free-solid-svg-icons";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    // 🚀 替换: table.filter.connect_wallet -> common.connect_wallet
    if (!isConnected) return t("common.connect_wallet");
    // 🚀 替换: table.filter.no_connected_wallet -> table.filter.no_connected_wallet (保持不变)
    if (myCount === 0) return t("table.filter.no_connected_wallet");

    // 🚀 替换: table.filter.show_all -> table.filter.show_all (保持不变)
    if (filterConfig.onlyMe) return t("table.filter.show_all");

    // 🚀 替换: table.filter.all_connected_wallet -> table.filter.all_connected_wallet (保持不变)
    if (isAllMine) return t("table.filter.all_connected_wallet");

    // 🚀 替换: table.filter.only_connected_wallet -> table.filter.only_connected_wallet (保持不变)
    return t("table.filter.only_connected_wallet", { count: myCount });
  };

  return (
    <ThWrapper>
      <div className="flex items-center gap-2 whitespace-nowrap">
        {/* 🚀 替换: table.header.owner -> table.header.owner (保持不变) */}
        <span>{t("table.header.owner")}</span>
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
          <SortButton
            field="owner"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAlphaDown}
            ascIcon={faSortAlphaDown}
            descIcon={faSortAlphaUp}
            // 🚀 替换: table.filter.sort_owner -> table.filter.sort_owner (保持不变)
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
              <FontAwesomeIcon icon={faWallet} size="sm" />
            </button>
          </Tooltip>
        </div>
      </div>
    </ThWrapper>
  );
};
