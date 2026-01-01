// src/components/NameTable/cells/ActionCell.tsx

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faWallet, faClock } from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../../../utils/ens";
import type { NameRecord } from "../../../types/ensNames";
import { Tooltip } from "../../ui/Tooltip"; // 🚀 引入 Tooltip

interface ActionCellProps {
  record: NameRecord;
  isConnected: boolean;
  isPending: boolean;
  isSelected?: boolean;
  onToggleSelection?: (label: string) => void;
  onRegister?: (record: NameRecord) => void;
  onRenew?: (record: NameRecord) => void;
}

export const ActionCell = ({
  record,
  isConnected,
  isPending,
  isSelected,
  onToggleSelection,
  onRegister,
  onRenew,
}: ActionCellProps) => {
  const renewable = isRenewable(record.status);

  // 优先级：未连接 > 链上可续费 > 本地挂起 > 默认注册
  const buttonConfig = useMemo(() => {
    if (!isConnected) {
      return {
        text: "未连接",
        style: "text-gray-400 cursor-not-allowed bg-transparent",
        icon: null,
        disabled: true,
        action: () => {},
      };
    }

    if (renewable) {
      return {
        text: "续费",
        style:
          "bg-inherit text-link border-b border-b-white/0 hover:text-link-hover hover:border-b hover:border-link-hover",
        icon: null,
        disabled: false,
        action: () => onRenew?.(record),
      };
    }

    if (isPending) {
      return {
        text: "继续",
        style:
          "bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded-lg hover:bg-orange-100 font-qs-bold shadow-sm",
        icon: faClock,
        disabled: false,
        action: () => onRegister?.(record),
      };
    }

    return {
      text: "注册",
      style:
        "bg-inherit text-link border-b border-b-white/0 hover:text-link-hover hover:border-b hover:border-link-hover",
      icon: null,
      disabled: false,
      action: () => onRegister?.(record),
    };
  }, [isConnected, renewable, isPending, record, onRenew, onRegister]);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!buttonConfig.disabled) {
      buttonConfig.action();
    }
  };

  return (
    <div className="h-12 flex items-center justify-start gap-3">
      {/* Checkbox: 仅在可续费时出现 */}
      {onToggleSelection && isConnected && renewable && (
        <Tooltip content="Select to renew">
          <input
            type="checkbox"
            disabled={!isConnected}
            className="w-4 h-4 rounded border-gray-400 text-link focus:ring-link/20 transition-all cursor-pointer"
            checked={isSelected}
            onChange={() => onToggleSelection(record.label)}
            onClick={(e) => e.stopPropagation()}
          />
        </Tooltip>
      )}

      {/* 占位符：不可续费且连接时 */}
      {onToggleSelection && isConnected && !renewable && (
        <Tooltip content="Registrable">
          <div className="w-4 h-4 flex items-center justify-center text-gray-400 select-none">
            <FontAwesomeIcon icon={faPlus} size="2xs" />
          </div>
        </Tooltip>
      )}

      {/* 钱包图标：未连接时 */}
      {!isConnected && (
        <Tooltip content="Connect Wallet">
          <div className="w-4 h-4 flex items-center justify-center text-gray-400 select-none">
            <FontAwesomeIcon icon={faWallet} size="2xs" />
          </div>
        </Tooltip>
      )}

      {/* 主操作按钮 */}
      <button
        disabled={buttonConfig.disabled}
        onClick={handleAction}
        className={`text-sm tracking-wide transition-all active:scale-95 flex items-center gap-1.5 ${buttonConfig.style}`}
      >
        {buttonConfig.icon && (
          <FontAwesomeIcon icon={buttonConfig.icon} size="xs" />
        )}
        {buttonConfig.text}
      </button>
    </div>
  );
};
