// src/components/NameTable/TableRow.tsx

import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faPlus,
  faWallet, // 🚀 1. Import Wallet Icon
} from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../../utils/ens";
import { getAvailableLookups } from "../../utils/lookupProvider";
import type { NameRecord } from "../../types/ensNames";

// ============================================================================
// 1. Style Constants
// ============================================================================

const STYLES = {
  // Cell container: Standard height 56px (h-12)
  cell: "h-12 flex items-center",
};

const STATUS_COLOR_MAP: Record<string, string> = {
  Available: "bg-green-200",
  Active: "bg-cyan-200",
  Grace: "bg-yellow-200",
  Premium: "bg-purple-200",
  Released: "bg-green-200",
};

// ============================================================================
// 2. Helper Functions
// ============================================================================

const formatRemainingTime = (seconds: number) => {
  if (seconds <= 0) return "已结束";
  const days = Math.floor(seconds / 86400);
  if (days > 365) return `${(days / 365).toFixed(1)}年`;
  if (days > 0) return `${days}天`;
  const hours = Math.floor(seconds / 3600);
  return `${hours}小时`;
};

// ============================================================================
// 3. Component Definition
// ============================================================================

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
}

export const TableRow = memo(
  ({
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
  }: TableRowProps) => {
    const isMe =
      currentAddress &&
      record.owner?.toLowerCase() === currentAddress.toLowerCase();
    const renewable = isRenewable(record.status);
    const availableLookups = getAvailableLookups(record, chainId);

    const statusClass =
      STATUS_COLOR_MAP[record.status] ||
      "bg-gray-50 text-text-main border-table-border";

    const getTimeInfo = () => {
      if (now === 0) return null;
      const PREMIUM_PERIOD = 21 * 24 * 60 * 60;
      if (record.status === "Active" && record.expiryTime)
        return formatRemainingTime(record.expiryTime - now);
      if (record.status === "Grace" && record.releaseTime)
        return formatRemainingTime(record.releaseTime - now);
      if (record.status === "Premium" && record.releaseTime)
        return formatRemainingTime(record.releaseTime + PREMIUM_PERIOD - now);
      return null;
    };
    const timeInfo = getTimeInfo();

    return (
      <tr className="group transition-colors duration-150 last:border-0 hover:bg-link/10 bg-table-row">
        {/* 1. Index Column */}
        <td className="w-14 text-center">
          <div className="h-12 flex items-center justify-center">
            <span className="text-xs text-gray-400">{index + 1}</span>
          </div>
        </td>

        {/* 2. Name Column */}
        <td>
          <div className={STYLES.cell}>
            <div
              className={`flex flex-col justify-center ${
                record.wrapped ? "px-1 border border-link/70 bg-link/5" : ""
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-base font-qs-medium tracking-tight text-text-main">
                  {record.label}
                </span>
                <span className="text-sm font-qs-regular text-gray-400">
                  .eth
                </span>
              </div>
            </div>
          </div>
        </td>

        {/* 3. Status & Time */}
        <td>
          <div className="h-12 flex flex-col justify-center items-start">
            <div
              className={`inline-flex items-center px-2.5 py-1 text-xs uppercase tracking-wide ${statusClass}`}
            >
              <span>{record.status}</span>
              {timeInfo && (
                <span className="pl-1 text-[10px] text-gray-400 leading-none">
                  {timeInfo}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* 4. Owner Column */}
        <td>
          <div className={STYLES.cell}>
            {record.owner ? (
              <div
                className={`flex items-center gap-2 text-sm ${
                  isMe ? "" : "text-text-main"
                }`}
              >
                <span
                  title={record.owner}
                  className={record.ownerPrimaryName ? "" : "text-gray-400"}
                >
                  {record.ownerPrimaryName ||
                    `${record.owner.slice(0, 6)}...${record.owner.slice(-4)}`}
                </span>
                {isMe && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-link opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-link"></span>
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-300 text-xs">—</span>
            )}
          </div>
        </td>

        {/* 5. Info & Links */}
        <td className="text-center">
          <div className={`${STYLES.cell} gap-1.5`}>
            {availableLookups.map((item) => (
              <a
                key={item.key}
                href={item.getLink(record, chainId)}
                target="_blank"
                rel="noopener noreferrer"
                title={item.label}
                className="w-6 h-6 flex items-center justify-center font-qs-medium bg-link text-sm text-white hover:bg-link-hover hover:text-white transition-all uppercase"
              >
                {item.key.slice(0, 1)}
              </a>
            ))}
          </div>
        </td>

        {/* 6. Action Column (Checkbox + Button) */}
        <td className="text-right">
          <div className={`${STYLES.cell} gap-2`}>
            {/* Logic 1: Connected + Renewable = Checkbox */}
            {onToggleSelection && isConnected && renewable && (
              <input
                type="checkbox"
                disabled={!isConnected}
                className={`w-4 h-4 rounded border-gray-400 text-link focus:ring-link/20 transition-all ${isConnected ? "cursor-pointer" : "cursor-not-allowed bg-gray-100"}`}
                checked={isSelected}
                onChange={() => onToggleSelection(record.label)}
                onClick={(e) => e.stopPropagation()}
                title="Select to renew"
              />
            )}

            {/* Logic 2: Connected + NOT Renewable (Register) = Plus Icon */}
            {onToggleSelection && isConnected && !renewable && (
              <div
                className="w-4 h-4 flex items-center justify-center text-gray-400 select-none"
                title="Registrable"
              >
                <FontAwesomeIcon icon={faPlus} size="2xs" />
              </div>
            )}

            {/* 🚀 Logic 3: Not Connected = Wallet Icon (Placeholder) */}
            {!isConnected && (
              <div
                className="w-4 h-4 flex items-center justify-center text-gray-400 select-none"
                title="Connect Wallet"
              >
                <FontAwesomeIcon icon={faWallet} size="2xs" />
              </div>
            )}

            <button
              disabled={!isConnected}
              className={`
                text-sm tracking-wide transition-all active:scale-95
                ${
                  isConnected
                    ? "bg-inherit text-link border-b border-b-white/0 hover:text-link-hover hover:border-b hover:border-link-hover"
                    : "text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {isConnected ? (renewable ? "续费" : "注册") : "未连接"}
            </button>
          </div>
        </td>

        {/* 7. Delete Column */}
        <td className="text-center">
          <div className="h-12 flex items-center justify-center">
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
              title={canDelete ? "Delete" : "Unavailable"}
            >
              <FontAwesomeIcon icon={faCircleXmark} size="sm" />
            </button>
          </div>
        </td>
      </tr>
    );
  },
);
