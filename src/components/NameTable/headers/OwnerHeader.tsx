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
  // 🚀 修改 props: 引入 ownershipCounts，移除旧的 count
  ownershipCounts: { mine: number; others: number };
  disabled?: boolean;
}

export const OwnerHeader = ({
  sortConfig,
  filterConfig,
  isConnected,
  onSort,
  onFilterChange,
  ownershipCounts,
  disabled,
}: OwnerHeaderProps) => {
  const { t } = useTranslation();
  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";
  const buttonActiveClass = "bg-link text-white hover:bg-link-hover";
  const buttonInactiveClass = "text-link hover:bg-gray-50";

  // 🚀 核心逻辑简化：
  // 显示条件：已连接钱包 AND ( 当前处于筛选状态 OR 表格中存在混合归属 )
  // 这样既符合"仅在混合时显示"，又防止了筛选后按钮消失无法取消的问题
  const showFilterButton =
    isConnected &&
    (filterConfig.onlyMe ||
      (ownershipCounts.mine > 0 && ownershipCounts.others > 0));

  return (
    <ThWrapper>
      <div className="flex items-center gap-2 whitespace-nowrap">
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

          {showFilterButton && (
            <Tooltip
              content={
                filterConfig.onlyMe
                  ? t("table.filter.show_all")
                  : t("table.filter.only_connected_wallet", {
                      count: ownershipCounts.mine,
                    })
              }
            >
              <button
                disabled={disabled}
                onClick={() =>
                  !disabled &&
                  onFilterChange({
                    ...filterConfig,
                    onlyMe: !filterConfig.onlyMe,
                  })
                }
                className={`${buttonBaseClass} ${
                  filterConfig.onlyMe ? buttonActiveClass : buttonInactiveClass
                }`}
              >
                <FontAwesomeIcon icon={faWallet} size="sm" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </ThWrapper>
  );
};
