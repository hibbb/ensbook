// src/components/NameTable/cells/ActionCell.tsx

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faClock,
  faBell,
  faTriangleExclamation,
  type IconDefinition,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const renewable = isRenewable(record.status);

  const config = useMemo<ActionConfig>(() => {
    if (!isConnected) {
      return {
        text: t("common.not_connected"),
        style: "text-gray-400 cursor-not-allowed bg-transparent",
        disabled: true,
        action: () => {},
      };
    }

    if (record.status === "Unknown") {
      return {
        text: t("common.unknown"),
        style: "text-gray-300 cursor-not-allowed bg-transparent",
        disabled: true,
        action: () => {},
        sideIcon: faTriangleExclamation,
        sideIconClass: "text-gray-300",
        sideTooltip: t("table.cell.unknown_status"),
      };
    }

    if (renewable) {
      return {
        text: t("table.cell.renew"),
        style:
          "bg-inherit text-link border-b border-b-white/0 hover:text-link-hover hover:border-b hover:border-link-hover",
        disabled: false,
        action: () => onRenew?.(record),
        sideIcon: faBell,
        sideIconClass:
          "text-amber-300 hover:text-amber-600 transition-colors cursor-pointer",
        sideTooltip: t("table.cell.set_reminder"),
        sideAction: () => onReminder?.(record),
      };
    }

    if (isPending) {
      return {
        text: t("table.cell.continue"),
        style:
          "bg-orange-50 text-orange-600 border border-orange-200 px-3 py-0.5 rounded-lg hover:bg-orange-100 font-qs-semibold shadow-sm transition-all active:scale-95",
        disabled: false,
        action: () => onRegister?.(record),
        sideIcon: faClock,
        sideIconClass: "text-orange-400 animate-pulse cursor-help",
        sideTooltip: t("table.cell.reg_pending"),
      };
    }

    if (isRegistrable(record.status)) {
      return {
        text: t("table.cell.register"),
        style:
          "bg-inherit text-link border-b border-b-white/0 hover:text-link-hover hover:border-b hover:border-link-hover",
        disabled: false,
        action: () => onRegister?.(record),
      };
    }

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
    record,
    onRenew,
    onRegister,
    onReminder,
    t,
  ]);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!config.disabled) {
      config.action();
    }
  };

  return (
    <div className="h-12 flex items-center justify-start gap-3">
      {onToggleSelection && isConnected && renewable && (
        <Tooltip content={t("table.cell.select_renew")}>
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

      {onToggleSelection &&
        isConnected &&
        !renewable &&
        record.status !== "Unknown" && (
          <div className="w-4 h-4 flex items-center justify-center text-link select-none">
            <FontAwesomeIcon icon={faCartShopping} size="sm" />
          </div>
        )}

      {!isConnected && (
        <Tooltip content={t("common.connect_wallet")}>
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
