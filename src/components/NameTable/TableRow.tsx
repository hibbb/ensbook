// src/components/NameTable/TableRow.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus } from "@fortawesome/free-solid-svg-icons"; // 🚀
import type { NameRecord } from "../../types/ensNames";
import { Tooltip } from "../ui/Tooltip";

import { IndexCell } from "./cells/IndexCell";
import { NameCell } from "./cells/NameCell";
import { StatusCell } from "./cells/StatusCell";
import { OwnerCell } from "./cells/OwnerCell";
import { MarketCell } from "./cells/MarketCell";
import { ActionCell } from "./cells/ActionCell";
import { LookupsCell } from "./cells/LookupsCell";

import type { SimpleMarketData } from "../../types/marketData";
import { useTranslation } from "react-i18next";

interface TableRowProps {
  record: NameRecord;
  index: number;
  now: number;
  isConnected: boolean;
  // 🗑️ 删除: canDelete?: boolean;
  onDelete?: (record: NameRecord) => void;
  // 🚀 新增
  onAddToHome?: (record: NameRecord) => void;
  isSelected?: boolean;
  onToggleSelection?: (label: string) => void;
  onRegister?: (record: NameRecord) => void;
  onRenew?: (record: NameRecord) => void;
  onReminder?: (record: NameRecord) => void;
  isPending?: boolean;
  onLevelChange?: (record: NameRecord, newLevel: number) => void;
  marketData?: SimpleMarketData;
  isMarketLoading?: boolean;
}

export const TableRow = ({
  record,
  index,
  now,
  isConnected,
  // 🗑️ 删除: canDelete
  onDelete,
  onAddToHome, // 🚀
  isSelected,
  onToggleSelection,
  onRegister,
  onRenew,
  onReminder,
  isPending = false,
  onLevelChange,
  marketData,
  isMarketLoading = false,
}: TableRowProps) => {
  const { t } = useTranslation();

  return (
    <tr className="group transition-colors duration-150 last:border-0 hover:bg-cyan-50 bg-table-row">
      <td className="w-14 text-center">
        <IndexCell
          index={index}
          level={record.level || 0}
          onLevelChange={(newLevel) => onLevelChange?.(record, newLevel)}
        />
      </td>

      <td>
        <NameCell record={record} />
      </td>

      <td>
        <StatusCell record={record} now={now} />
      </td>

      <td>
        <OwnerCell record={record} />
      </td>

      <td>
        <MarketCell data={marketData} isLoading={isMarketLoading} />
      </td>

      <td className="text-right">
        <ActionCell
          record={record}
          isConnected={isConnected}
          isPending={isPending}
          isSelected={isSelected}
          onToggleSelection={onToggleSelection}
          onRegister={onRegister}
          onRenew={onRenew}
          onReminder={onReminder}
        />
      </td>

      <td className="text-center">
        <LookupsCell record={record} />
      </td>

      <td className="text-center">
        <div className="h-12 flex items-center justify-center">
          {/* 🚀 逻辑简化：有 onDelete 就显示删除，有 onAddToHome 就显示添加 */}
          {onDelete ? (
            <Tooltip
              content={t("table.cell.delete_item", { label: record.label })}
            >
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
            /* 🚀 添加模式按钮 */
            <Tooltip
              content={t("table.cell.add_to_home", { label: record.label })}
            >
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
            /* 既不能删也不能加（极少情况，或者是占位） */
            <span className="text-gray-200 text-xs">—</span>
          )}
        </div>
      </td>
    </tr>
  );
};
