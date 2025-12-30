import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { SortField, SortConfig } from "../types";

interface SortButtonProps {
  field: SortField;
  currentSort: SortConfig;
  onSort: (field: SortField) => void;
  defaultIcon: IconDefinition;
  ascIcon: IconDefinition;
  descIcon: IconDefinition;
  title?: string;
}

export const SortButton = ({
  field,
  currentSort,
  onSort,
  defaultIcon,
  ascIcon,
  descIcon,
  title,
}: SortButtonProps) => {
  const isActive =
    currentSort.field === field && currentSort.direction !== null;
  const isAsc = isActive && currentSort.direction === "asc";
  const isDesc = isActive && currentSort.direction === "desc";

  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";
  const buttonActiveClass = "bg-link text-white hover:bg-link-hover";
  const buttonInactiveClass = "text-link hover:bg-gray-50";

  return (
    <button
      onClick={() => onSort(field)}
      className={`${buttonBaseClass} ${
        isActive ? buttonActiveClass : buttonInactiveClass
      }`}
      title={title}
    >
      <FontAwesomeIcon
        icon={isAsc ? ascIcon : isDesc ? descIcon : defaultIcon}
        size="sm"
      />
    </button>
  );
};
