import {
  faSortAlphaDown,
  faSortAlphaUp,
  faSortAmountDown,
  faSortAmountUp,
} from "@fortawesome/free-solid-svg-icons";
import { ThWrapper } from "./ThWrapper";
import { SortButton } from "./SortButton";
import type { SortConfig, SortField } from "../types";

interface NameHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
}

export const NameHeader = ({ sortConfig, onSort }: NameHeaderProps) => {
  return (
    <ThWrapper>
      <div className="flex items-center gap-2">
        <span>名称</span>
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300/50">
          <SortButton
            field="label"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAlphaDown}
            ascIcon={faSortAlphaDown}
            descIcon={faSortAlphaUp}
            title="按名称字母排序"
          />
          <SortButton
            field="length"
            currentSort={sortConfig}
            onSort={onSort}
            defaultIcon={faSortAmountDown}
            ascIcon={faSortAmountUp}
            descIcon={faSortAmountDown}
            title="按长度排序"
          />
        </div>
      </div>
    </ThWrapper>
  );
};
