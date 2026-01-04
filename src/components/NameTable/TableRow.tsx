// src/components/NameTable/TableRow.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import type { NameRecord } from "../../types/ensNames";

import { NameCell } from "./cells/NameCell";
import { StatusCell } from "./cells/StatusCell";
import { OwnerCell } from "./cells/OwnerCell";
import { LookupsCell } from "./cells/LookupsCell";
import { ActionCell } from "./cells/ActionCell";
import { Tooltip } from "../ui/Tooltip";

interface TableRowProps {
  // 🚀 新增 prop
  context: "home" | "collection";

  record: NameRecord;
  index: number;
  now: number;
  currentAddress?: string;
  isConnected: boolean;
  chainId?: number;
  canDelete?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (label: string) => void;
  onDelete?: (record: NameRecord) => void;
  onRegister?: (record: NameRecord) => void;
  onRenew?: (record: NameRecord) => void;
  onReminder?: (record: NameRecord) => void;
  isPending?: boolean;
}

export const TableRow = ({
  context, // 🚀 解构
  record,
  index,
  now,
  currentAddress,
  isConnected,
  chainId,
  canDelete = true,
  onDelete,
  isSelected,
  onToggleSelection,
  onRegister,
  onRenew,
  onReminder,
  isPending = false,
}: TableRowProps) => {
  return (
    <tr className="group transition-colors duration-150 last:border-0 hover:bg-link/10 bg-table-row">
      <td className="w-14 text-center">
        <div className="h-12 flex items-center justify-center">
          <span className="text-xs text-gray-400">{index + 1}</span>
        </div>
      </td>

      <td>
        {/* 🚀 透传 context 给 NameCell (用于 MemoEditor) */}
        <NameCell record={record} context={context} />
      </td>

      <td>
        <StatusCell record={record} now={now} />
      </td>

      <td>
        <OwnerCell record={record} currentAddress={currentAddress} />
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
        <LookupsCell record={record} chainId={chainId} />
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
              transition-all duration-200
              ${
                canDelete
                  ? "text-gray-300 hover:text-link active:scale-95"
                  : "text-gray-200 cursor-not-allowed"
              }
            `}
            >
              <FontAwesomeIcon icon={faCircleXmark} size="sm" />
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
};
