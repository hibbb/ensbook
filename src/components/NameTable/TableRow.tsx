// src/components/NameTable/TableRow.tsx

import type { NameRecord } from "../../types/ensNames";

import { IndexCell } from "./cells/IndexCell";
import { NameCell } from "./cells/NameCell";
import { StatusCell } from "./cells/StatusCell";
import { OwnerCell } from "./cells/OwnerCell";
import { MarketCell } from "./cells/MarketCell";
import { ActionCell } from "./cells/ActionCell";
import { LookupsCell } from "./cells/LookupsCell";
import { ControlCell } from "./cells/ControlCell";

import type { SimpleMarketData } from "../../types/marketData";

interface TableRowProps {
  record: NameRecord;
  index: number;
  now: number;
  isConnected: boolean;
  onDelete?: (record: NameRecord) => void;
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
  isOwnerColumnReadOnly?: boolean; // 🚀 新增
}

export const TableRow = ({
  record,
  index,
  now,
  isConnected,
  onDelete,
  onAddToHome,
  isSelected,
  onToggleSelection,
  onRegister,
  onRenew,
  onReminder,
  isPending = false,
  onLevelChange,
  marketData,
  isMarketLoading = false,
  isOwnerColumnReadOnly, // 🚀 解构
}: TableRowProps) => {
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
        <OwnerCell record={record} disableLink={isOwnerColumnReadOnly} />
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
        <ControlCell
          record={record}
          onDelete={onDelete}
          onAddToHome={onAddToHome}
        />
      </td>
    </tr>
  );
};
