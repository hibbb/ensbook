// src/components/NameTable/TableRow.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import type { NameRecord } from "../../types/ensNames";

// 引入拆分后的单元格组件
import { NameCell } from "./cells/NameCell";
import { StatusCell } from "./cells/StatusCell";
import { OwnerCell } from "./cells/OwnerCell";
import { LookupsCell } from "./cells/LookupsCell";
import { ActionCell } from "./cells/ActionCell";
import { Tooltip } from "../ui/Tooltip"; // 🚀 引入 Tooltip

interface TableRowProps {
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
  isPending?: boolean;
}

export const TableRow = ({
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
  isPending = false,
}: TableRowProps) => {
  return (
    <tr className="group transition-colors duration-150 last:border-0 hover:bg-link/10 bg-table-row">
      {/* 1. 序号 */}
      <td className="w-14 text-center">
        <div className="h-12 flex items-center justify-center">
          <span className="text-xs text-gray-400">{index + 1}</span>
        </div>
      </td>

      {/* 2. 名称 */}
      <td>
        <NameCell record={record} />
      </td>

      {/* 3. 状态 (含时间与价格) */}
      <td>
        <StatusCell record={record} now={now} />
      </td>

      {/* 4. 所有者 */}
      <td>
        <OwnerCell record={record} currentAddress={currentAddress} />
      </td>

      {/* 5. 操作 (注册/续费/选择) */}
      <td className="text-right">
        <ActionCell
          record={record}
          isConnected={isConnected}
          isPending={isPending}
          isSelected={isSelected}
          onToggleSelection={onToggleSelection}
          onRegister={onRegister}
          onRenew={onRenew}
        />
      </td>

      {/* 6. 外部链接 */}
      <td className="text-center">
        <LookupsCell record={record} chainId={chainId} />
      </td>

      {/* 7. 删除按钮 */}
      <td className="text-center">
        <div className="h-12 flex items-center justify-center">
          {/* 🚀 使用 Tooltip 包裹并移除 title */}
          <Tooltip
            content={canDelete ? `删除 ${record.label}.eth` : "Unavailable"}
          >
            <button
              disabled={!canDelete}
              onClick={() => onDelete?.(record)}
              className={`
              transition-all duration-200
              ${
                canDelete
                  ? "text-link hover:text-link-hover active:scale-95"
                  : "text-gray-400 cursor-not-allowed opacity-50"
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
