import {
  faSortAlphaDown,
  faSortAlphaUp,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThWrapper } from "./ThWrapper";
import { SortButton } from "./SortButton";
import type { SortConfig, SortField, FilterConfig } from "../types";

interface OwnerHeaderProps {
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  isConnected: boolean;
  onSort: (field: SortField) => void;
  onFilterChange: (config: FilterConfig) => void;
}

export const OwnerHeader = ({
  sortConfig,
  filterConfig,
  isConnected,
  onSort,
  onFilterChange,
}: OwnerHeaderProps) => {
  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";
  const buttonActiveClass = "bg-link text-white hover:bg-link-hover";
  const buttonInactiveClass = "text-link hover:bg-gray-50";

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
          <button
            onClick={() =>
              isConnected &&
              onFilterChange({
                ...filterConfig,
                onlyMe: !filterConfig.onlyMe,
              })
            }
            className={`${buttonBaseClass} ${
              !isConnected
                ? "cursor-not-allowed opacity-50 text-gray-300"
                : filterConfig.onlyMe
                  ? buttonActiveClass
                  : buttonInactiveClass
            }`}
            title={isConnected ? "仅显示我的" : "请先连接钱包"}
          >
            <FontAwesomeIcon icon={faUser} size="xs" />
          </button>
        </div>
      </div>
    </ThWrapper>
  );
};
