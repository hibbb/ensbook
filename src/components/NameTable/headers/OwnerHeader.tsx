// src/components/NameTable/headers/OwnerHeader.tsx

import {
  faSortAlphaDown,
  faSortAlphaUp,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
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
  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";
  const buttonActiveClass = "bg-link text-white hover:bg-link-hover";
  const buttonInactiveClass = "text-link hover:bg-gray-50";

  // 判断：是否当前列表全部属于我
  const isAllMine = listCount > 0 && myCount === listCount;

  // 禁用逻辑：
  // 1. 未连接
  // 2. 我的数量为0
  // 3. 全部都是我的，且当前并未开启"只看我的"筛选 (因为此时筛选毫无意义)
  const isDisabled =
    disabled ||
    !isConnected ||
    myCount === 0 ||
    (isAllMine && !filterConfig.onlyMe);

  // 🚀 优化 Tooltip 文案逻辑
  const getTooltipContent = () => {
    if (!isConnected) return "请先连接钱包";
    if (myCount === 0) return "列表中没有属于已连接钱包的名称";

    // 优先处理已激活状态：提示取消
    if (filterConfig.onlyMe) return "显示所有名称";

    // 处理"全是我的"状态 (此时按钮是禁用的)
    if (isAllMine) return "列表中全部属于已连接钱包的名称";

    // 默认状态：提示筛选
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
