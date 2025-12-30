import {
  faSortAmountDown,
  faSortAmountUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
}

export const StatusHeader = ({
  sortConfig,
  filterConfig,
  onSort,
  onFilterChange,
}: StatusHeaderProps) => {
  return (
    <ThWrapper>
      <div className="flex items-center gap-2">
        <span>状态</span>
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
          <SortButton
            field="status"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAmountDown}
            ascIcon={faSortAmountUp}
            descIcon={faSortAmountDown}
            title="按过期时间排序"
          />

          <FilterDropdown isActive={filterConfig.statusList.length > 0}>
            <div
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 flex justify-between items-center ${
                filterConfig.statusList.length === 0
                  ? "text-link"
                  : "text-gray-500"
              }`}
              onClick={() =>
                onFilterChange({ ...filterConfig, statusList: [] })
              }
            >
              全部显示
              {filterConfig.statusList.length === 0 && (
                <FontAwesomeIcon icon={faCheck} />
              )}
            </div>
            {STATUS_OPTIONS.map((s) => (
              <div
                key={s}
                className={`px-4 py-2 ${STATUS_COLOR_TEXT[s]} ${STATUS_COLOR_BG_HOVER[s]} cursor-pointer flex justify-between items-center text-sm`}
                onClick={(e) => {
                  e.stopPropagation();
                  const newList = filterConfig.statusList.includes(s)
                    ? filterConfig.statusList.filter((i) => i !== s)
                    : [...filterConfig.statusList, s];
                  onFilterChange({
                    ...filterConfig,
                    statusList: newList,
                  });
                }}
              >
                {s}
                {filterConfig.statusList.includes(s) && (
                  <FontAwesomeIcon icon={faCheck} className="text-link" />
                )}
              </div>
            ))}
          </FilterDropdown>
        </div>
      </div>
    </ThWrapper>
  );
};
