// src/components/NameTable/cells/ActionCell.tsx

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faWallet,
  faClock,
  faBell,
  faTriangleExclamation,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
// 🚀 引入新函数 isRegistrable
import { isRenewable, isRegistrable } from "../../../utils/ens";
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

    // 2. Unknown 状态处理
    if (record.status === "Unknown") {
      return {
        text: "未知",
        style: "text-gray-300 cursor-not-allowed bg-transparent",
        disabled: true,
        action: () => {},
        sideIcon: faTriangleExclamation,
        sideIconClass: "text-gray-300",
        sideTooltip: "数据获取失败，无法操作",
      };
    }

    // 3. 可续费 (Renew)
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
        sideTooltip: "设置续费提醒",
        sideAction: () => onReminder?.(record),
      };
    }

    // 4. 挂起状态 (Continue)
    if (isPending) {
      return {
        text: "继续",
        style:
          "bg-orange-50 text-orange-600 border border-orange-200 px-3 py-0.5 rounded-lg hover:bg-orange-100 font-qs-semibold shadow-sm transition-all active:scale-95",
        disabled: false,
        action: () => onRegister?.(record),
        sideIcon: faClock,
        sideIconClass: "text-orange-400 animate-pulse cursor-help",
        sideTooltip: "注册未完成，点击继续",
      };
    }

    // 🚀 5. 显式可注册状态 (Available / Released / Premium)
    // 使用 isRegistrable 统一判断，包含 Premium
    if (isRegistrable(record.status)) {
      return {
        text: "注册",
        style:
          "bg-inherit text-link border-b border-b-white/0 hover:text-link-hover hover:border-b hover:border-link-hover",
        disabled: false,
        action: () => onRegister?.(record),
      };
    }

    // 6. 其他情况 (兜底)
    return {
      text: "—",
      style: "text-gray-300 cursor-not-allowed",
      disabled: true,
      action: () => {},
    };
  }, [
    isConnected,
    renewable,
    isPending,
    record, // record.status 变化会触发重新计算
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
      {/* Checkbox: 仅在可续费且连接时显示 */}
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

      {/* 占位符: 仅在不可续费但已连接时显示 (保持对齐) */}
      {onToggleSelection &&
        isConnected &&
        !renewable &&
        record.status !== "Unknown" && (
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
