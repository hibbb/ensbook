// src/components/NameTable/cells/ControlCell.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../../ui/Tooltip";
import type { NameRecord } from "../../../types/ensNames";

interface ControlCellProps {
  record: NameRecord;
  onDelete?: (record: NameRecord) => void;
  onAddToHome?: (record: NameRecord) => void;
}

export const ControlCell = ({
  record,
  onDelete,
  onAddToHome,
}: ControlCellProps) => {
  const { t } = useTranslation();

  return (
    <div className="h-12 flex items-center justify-center">
      {onDelete ? (
        <Tooltip content={t("table.cell.delete_item", { label: record.label })}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record);
            }}
            className="transition-all duration-200 text-xs text-red-300 hover:text-red-500 active:scale-95"
          >
            <FontAwesomeIcon icon={faXmark} size="sm" />
          </button>
        </Tooltip>
      ) : onAddToHome ? (
        <Tooltip content={t("table.cell.add_to_home", { label: record.label })}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToHome(record);
            }}
            className="transition-all duration-200 text-xs text-link hover:text-link-hover active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </button>
        </Tooltip>
      ) : (
        <span className="text-gray-200 text-xs">—</span>
      )}
    </div>
  );
};
