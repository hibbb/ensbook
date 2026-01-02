// src/components/NameTable/cells/ActionCell.tsx

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faWallet,
  faClock,
  faBell,
  type IconDefinition, // 引入类型
} from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../../../utils/ens";
import type { NameRecord } from "../../../types/ensNames";
import { Tooltip } from "../../ui/Tooltip";

interface ActionCellProps {
  record: NameRecord;
  isConnected: boolean;
  isPending: boolean;
  isSelected?: boolean;
  onToggleSelection?: (label: string) => void;
  onRegister?: (record: NameRecord) => void;
  onRenew?: (record: NameRecord) => void;
  onReminder?: (record: NameRecord) => void;
}

// 🚀 1. 定义统一的配置接口
interface ActionConfig {
  text: string;
  style: string;
  disabled: boolean;
  action: () => void;
  sideIcon?: IconDefinition;
  sideIconClass?: string;
  sideTooltip?: string;
  sideAction?: () => void;
}

export const ActionCell = ({
  record,
  isConnected,
  isPending,
  isSelected,
  onToggleSelection,
  onRegister,
  onRenew,
  onReminder,
}: ActionCellProps) => {
  const renewable = isRenewable(record.status);

  // 🚀 2. 显式指定返回类型为 ActionConfig
  const config = useMemo<ActionConfig>(() => {
    // 1. 未连接
    if (!isConnected) {
      return {
        text: "未连接",
        style: "text-gray-400 cursor-not-allowed bg-transparent",
        disabled: true,
        action: () => {},
      };
    }

    // 2. 可续费 (Renew)
    if (renewable) {
      return {
        text: "续费",
        style:
          "bg-inherit text-link border-b border-b-white/0 hover:text-link-hover hover:border-b hover:border-link-hover",
        disabled: false,
        action: () => onRenew?.(record),
        sideIcon: faBell,
        sideIconClass:
          "text-gray-300 hover:text-link transition-colors cursor-pointer",
        sideTooltip: "设置防断供提醒",
        sideAction: () => onReminder?.(record),
      };
    }

    // 3. 挂起状态 (Continue)
    if (isPending) {
      return {
        text: "继续",
        style:
          "bg-orange-50 text-orange-600 border border-orange-200 px-3 py-0.5 rounded-lg hover:bg-orange-100 font-qs-bold shadow-sm transition-all active:scale-95",
        disabled: false,
        action: () => onRegister?.(record),
        sideIcon: faClock,
        sideIconClass: "text-orange-400 animate-pulse cursor-help",
        sideTooltip: "注册未完成，点击继续",
        // 这里没有 sideAction，类型定义中它是可选的，所以安全
      };
    }

    // 4. 默认注册状态 (Register)
    return {
      text: "注册",
      style:
        "bg-inherit text-link border-b border-b-white/0 hover:text-link-hover hover:border-b hover:border-link-hover",
      disabled: false,
      action: () => onRegister?.(record),
    };
  }, [
    isConnected,
    renewable,
    isPending,
    record,
    onRenew,
    onRegister,
    onReminder,
  ]);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!config.disabled) {
      config.action();
    }
  };

  return (
    <div className="h-12 flex items-center justify-start gap-3">
      {/* ... Checkbox 和图标部分保持不变 ... */}
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

      {onToggleSelection && isConnected && !renewable && (
        <div className="w-4 h-4 flex items-center justify-center text-gray-400 select-none">
          <FontAwesomeIcon icon={faPlus} size="2xs" />
        </div>
      )}

      {!isConnected && (
        <Tooltip content="Connect Wallet">
          <div className="w-4 h-4 flex items-center justify-center text-gray-400 select-none">
            <FontAwesomeIcon icon={faWallet} size="2xs" />
          </div>
        </Tooltip>
      )}

      <div className="flex items-center gap-2">
        <button
          disabled={config.disabled}
          onClick={handleAction}
          className={`text-sm tracking-wide flex items-center justify-center ${config.style}`}
        >
          {config.text}
        </button>

        {config.sideIcon && (
          <Tooltip content={config.sideTooltip || ""}>
            <div
              className={config.sideIconClass}
              // 🚀 3. 安全的点击事件处理，无需 @ts-ignore
              onClick={(e) => {
                if (config.sideAction) {
                  e.stopPropagation();
                  config.sideAction();
                }
              }}
            >
              <FontAwesomeIcon icon={config.sideIcon} size="xs" />
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
