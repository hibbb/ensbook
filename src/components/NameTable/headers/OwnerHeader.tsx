// src/components/NameTable/headers/OwnerHeader.tsx

import {
  faSortAlphaDown,
  faSortAlphaUp,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
}

export const OwnerHeader = ({
  sortConfig,
  filterConfig,
  isConnected,
  onSort,
  onFilterChange,
  myCount = 0,
}: OwnerHeaderProps) => {
  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";
  const buttonActiveClass = "bg-link text-white hover:bg-link-hover";
  const buttonInactiveClass = "text-link hover:bg-gray-50";

  const isDisabled = !isConnected || myCount === 0;

  // 🚀 修改 Tooltip 文本逻辑
  const getTooltipContent = () => {
    if (!isConnected) return "请先连接钱包";
    // 新增：当数量为 0 时的提示
    if (myCount === 0) return "列表中没有属于我的名称";
    return `仅显示我的 (${myCount}) 个名称`;
  };

  return (
    <ThWrapper>
      <div className="flex items-center gap-2">
        <span>所有者</span>
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
          <SortButton
            field="owner"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAlphaDown}
            ascIcon={faSortAlphaDown}
            descIcon={faSortAlphaUp}
            title="按所有者排序"
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
