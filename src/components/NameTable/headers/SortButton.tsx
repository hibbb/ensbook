// src/components/NameTable/headers/SortButton.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { SortField, SortConfig } from "../types";
import { Tooltip } from "../../ui/Tooltip";

interface SortButtonProps {
  field: SortField;
  currentSort: SortConfig;
  onSort: (field: SortField) => void;
  defaultIcon: IconDefinition;
  ascIcon: IconDefinition;
  descIcon: IconDefinition;
  title?: string;
  disabled?: boolean;
}

export const SortButton = ({
  field,
  currentSort,
  onSort,
  defaultIcon,
  ascIcon,
  descIcon,
  title,
  disabled,
}: SortButtonProps) => {
  const isActive =
    currentSort.field === field && currentSort.direction !== null;
  const isAsc = isActive && currentSort.direction === "asc";
  const isDesc = isActive && currentSort.direction === "desc";

  const buttonBaseClass =
    "w-6 h-6 flex items-center justify-center rounded-md transition-all";

  let stateClass = "";
  if (disabled) {
    stateClass = "text-gray-300 cursor-not-allowed";
  } else if (isActive) {
    stateClass = "bg-link text-white hover:bg-link-hover";
  } else {
    stateClass = "text-link hover:bg-gray-50";
  }

  const buttonContent = (
    <button
      onClick={() => !disabled && onSort(field)}
      disabled={disabled}
      className={`${buttonBaseClass} ${stateClass}`}
    >
      <FontAwesomeIcon
        icon={isAsc ? ascIcon : isDesc ? descIcon : defaultIcon}
        size="sm"
      />
    </button>
  );

  if (title && !disabled) {
    return <Tooltip content={title}>{buttonContent}</Tooltip>;
  }

  return buttonContent;
};
