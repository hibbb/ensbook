// src/components/NameTable/cells/ActionCell.tsx

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faWallet, faClock } from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../../../utils/ens";
import type { NameRecord } from "../../../types/ensNames";

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

  // 🚀 核心优化：构建统一的按钮配置对象
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

    // 1. 优先级最高：如果链上状态是可续费，强制显示续费
    // 这解决了“用户在别处注册后，本地仍显示断点续传”的错配问题
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

    // 2. 优先级次之：断点续传
    // 只有在不可续费（即未注册或过期）的情况下，才检查本地挂起状态
    if (isPending) {
      return {
        text: "继续",
        style:
          "bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-lg hover:bg-orange-100 font-qs-bold shadow-sm",
        icon: faClock,
        disabled: false,
        action: () => onRegister?.(record), // 继续注册也是调用的 register 接口，由父组件判断进入 resume 流程
      };
    }

    // 3. 默认状态：注册
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
      {/* Checkbox 逻辑：仅在可续费时出现 */}
      {onToggleSelection && isConnected && renewable && (
        <input
          type="checkbox"
          disabled={!isConnected}
          className="w-4 h-4 rounded border-gray-400 text-link focus:ring-link/20 transition-all cursor-pointer"
          checked={isSelected}
          onChange={() => onToggleSelection(record.label)}
          onClick={(e) => e.stopPropagation()}
          title="Select to renew"
        />
      )}

      {/* 占位符：不可续费且连接时 */}
      {onToggleSelection && isConnected && !renewable && (
        <div
          className="w-4 h-4 flex items-center justify-center text-gray-400 select-none"
          title="Registrable"
        >
          <FontAwesomeIcon icon={faPlus} size="2xs" />
        </div>
      )}

      {/* 钱包图标：未连接时 */}
      {!isConnected && (
        <div
          className="w-4 h-4 flex items-center justify-center text-gray-400 select-none"
          title="Connect Wallet"
        >
          <FontAwesomeIcon icon={faWallet} size="2xs" />
        </div>
      )}

      {/* 主操作按钮：完全由 Config 驱动，杜绝样式文本不一致 */}
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
