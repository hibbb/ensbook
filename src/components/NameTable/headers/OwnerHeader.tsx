// src/components/NameTable/headers/OwnerHeader.tsx

import {
  faSortAlphaDown,
  faSortAlphaUp,
  faCheck,
  faUser,
  faWallet,
  faUsers, // 🚀 引入统计图标
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { ThWrapper } from "./ThWrapper";
import { SortButton } from "./SortButton";
import { FilterDropdown } from "../FilterDropdown";
import type { SortConfig, SortField, FilterConfig } from "../types";

interface OwnerHeaderProps {
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  isConnected: boolean;
  onSort: (field: SortField) => void;
  onFilterChange: (config: FilterConfig) => void;
  ownerCounts: {
    count: number;
    label: string;
    address: string;
    isMyself: boolean;
  }[];
  // 🚀 接收统计信息
  ownerStats: { total: number; displayed: number };
  disabled?: boolean;
}

export const OwnerHeader = ({
  sortConfig,
  filterConfig,
  onSort,
  onFilterChange,
  ownerCounts,
  ownerStats, // 🚀 解构
  disabled,
}: OwnerHeaderProps) => {
  const { t } = useTranslation();

  const { ownerList } = filterConfig;
  const isActive = ownerList.length > 0;

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

          {/* 🗑️ 已移除单独的“Only Me”按钮 */}

          <FilterDropdown
            isActive={isActive}
            title={t("table.filter.filter_owner")}
            menuWidth="w-64"
            disabled={disabled}
          >
            {/* 1. Show All */}
            <div
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 flex justify-between items-center transition-colors ${
                ownerList.length === 0 ? "text-link" : "text-gray-500"
              }`}
              onClick={() =>
                onFilterChange({
                  ...filterConfig,
                  ownerList: [],
                })
              }
            >
              <span>{t("table.filter.all_show")}</span>
              {ownerList.length === 0 && <FontAwesomeIcon icon={faCheck} />}
            </div>

            {/* 🚀 2. Statistics Bar */}
            <div className="bg-gray-50 border-y border-gray-100 px-4 py-1.5 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-wider font-sans font-semibold select-none my-1">
              <div className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faUsers} />
                <span>Owners</span>
              </div>
              <span>
                {/* 使用翻译函数 */}
                {t("table.filter.owner_stats", {
                  displayed: ownerStats.displayed,
                  total: ownerStats.total,
                })}
              </span>
            </div>

            {/* 3. Owner List */}
            {ownerCounts.length > 0 ? (
              ownerCounts.map((item) => {
                const isSelected = ownerList.includes(item.address);

                // 动态样式：自己高亮
                let containerClass =
                  "px-4 py-2 text-sm flex justify-between items-center transition-colors cursor-pointer hover:bg-gray-50 text-text-main ";

                if (isSelected) {
                  containerClass += "font-sans font-semibold ";
                  if (!item.isMyself) containerClass += "text-link ";
                }

                return (
                  <div
                    key={item.address}
                    className={containerClass}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newList = isSelected
                        ? ownerList.filter((addr) => addr !== item.address)
                        : [...ownerList, item.address];

                      onFilterChange({
                        ...filterConfig,
                        ownerList: newList,
                      });
                    }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        className={`w-5 flex justify-center ${item.isMyself ? "text-link" : "text-gray-400"}`}
                      >
                        {/* 动态图标：自己显示 Wallet */}
                        <FontAwesomeIcon
                          icon={item.isMyself ? faWallet : faUser}
                          size="xs"
                        />
                      </div>
                      <span
                        className="truncate max-w-[140px]"
                        title={item.label}
                      >
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-2">
                      <span
                        className={`text-xs font-sans font-regular ${item.isMyself ? "text-link" : "text-gray-400"}`}
                      >
                        ({item.count})
                      </span>
                      {isSelected && (
                        <FontAwesomeIcon icon={faCheck} className="text-link" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-2 text-xs text-gray-400 text-center italic">
                {t("table.filter.no_owners")}
              </div>
            )}
          </FilterDropdown>
        </div>
      </div>
    </ThWrapper>
  );
};
