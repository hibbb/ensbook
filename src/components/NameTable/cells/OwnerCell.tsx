// src/components/NameTable/cells/OwnerCell.tsx

import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next"; // 🚀
import type { NameRecord } from "../../../types/ensNames";
import { Tooltip } from "../../ui/Tooltip";

interface OwnerCellProps {
  record: NameRecord;
  currentAddress?: string;
}

export const OwnerCell = ({ record, currentAddress }: OwnerCellProps) => {
  const { t } = useTranslation(); // 🚀
  const isMe =
    currentAddress &&
    record.owner?.toLowerCase() === currentAddress.toLowerCase();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("table.cell.copy_success", { label }));
  };

  const renderTooltipContent = () => {
    if (!record.owner) return null;

    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-qs-semibold">
              {t("table.cell.owner_addr")}
            </span>
            <span className="font-qs-medium text-xs">
              {record.owner.slice(0, 6)}...{record.owner.slice(-4)}
            </span>
          </div>
          <button
            onClick={() =>
              handleCopy(record.owner!, t("table.cell.owner_addr"))
            }
            className="text-gray-400 hover:text-white transition-colors p-1"
            title={t("table.cell.copy_addr")}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>

        {record.ownerPrimaryName && (
          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-qs-semibold">
                {t("table.cell.primary_name")}
              </span>
              <span className="font-qs-medium text-xs">
                {record.ownerPrimaryName}
              </span>
            </div>
            <button
              onClick={() =>
                handleCopy(
                  record.ownerPrimaryName!,
                  t("table.cell.primary_name"),
                )
              }
              className="text-gray-400 hover:text-white transition-colors p-1"
              title={t("table.cell.copy_primary")}
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        )}

        {isMe && (
          <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-2 pb-1">
            <span className="text-sm text-link">~</span>
            <span className="font-qs-semibold text-[11px]">
              {t("table.cell.is_me")}
            </span>
            <span className="text-sm text-link">~</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-12 flex items-center">
      {record.owner ? (
        <div className="flex items-center gap-1.5 text-sm">
          {isMe && <span className="text-sm text-link">{"~"}</span>}
          <Tooltip content={renderTooltipContent()}>
            <span
              className={`cursor-default ${record.ownerPrimaryName ? "" : "text-gray-400"}`}
            >
              {record.ownerPrimaryName ||
                `${record.owner.slice(0, 6)}...${record.owner.slice(-4)}`}
            </span>
          </Tooltip>
          {isMe && <span className="text-sm text-link">{"~"}</span>}
        </div>
      ) : (
        <span className="text-gray-300 text-xs">—</span>
      )}
    </div>
  );
};
