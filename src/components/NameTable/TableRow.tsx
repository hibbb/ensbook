// src/components/NameTable/TableRow.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NameRecord } from "../../types/ensNames";
import { Tooltip } from "../ui/Tooltip";

import { IndexCell } from "./cells/IndexCell";
import { NameCell } from "./cells/NameCell";
import { StatusCell } from "./cells/StatusCell";
import { OwnerCell } from "./cells/OwnerCell";
import { MarketCell } from "./cells/MarketCell"; // 🚀
import { ActionCell } from "./cells/ActionCell";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { LookupsCell } from "./cells/LookupsCell";

import type { SimpleMarketData } from "../../types/marketData"; // 🚀

interface TableRowProps {
  record: NameRecord;
  index: number;
  now: number;
  isConnected: boolean;
  canDelete?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (label: string) => void;
  onDelete?: (record: NameRecord) => void;
  onRegister?: (record: NameRecord) => void;
  onRenew?: (record: NameRecord) => void;
  onReminder?: (record: NameRecord) => void;
  isPending?: boolean;
  onLevelChange?: (record: NameRecord, newLevel: number) => void;
  // 🚀 新增 Props
  marketData?: SimpleMarketData;
  isMarketLoading?: boolean;
}

export const TableRow = ({
  record,
  index,
  now,
  isConnected,
  canDelete = true,
  onDelete,
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
  return (
    <tr className="group transition-colors duration-150 last:border-0 hover:bg-cyan-50 bg-table-row">
      <td className="w-14 text-center">
        {/* 🚀 3. 替换旧的 span，使用 IndexCell */}
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

      {/* 🚀 Insert Market Cell */}
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
          <Tooltip
            content={canDelete ? `删除 ${record.label}.eth` : "不可删除"}
          >
            <button
              disabled={!canDelete}
              onClick={() => onDelete?.(record)}
              className={`
              transition-all duration-200 text-xs
              ${
                canDelete
                  ? "text-link hover:text-link-hover active:scale-95"
                  : "text-gray-200 cursor-not-allowed"
              }
            `}
            >
              <FontAwesomeIcon icon={faXmark} size="sm" />
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
};
