// src/components/NameTable/TableRow.tsx

import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../../utils/ens";
import { getAvailableLookups } from "../../utils/lookupProvider";
import type { NameRecord } from "../../types/ensNames";

// ============================================================================
// 1. 样式常量与生成器 (Style Constants & Generators)
//    将复杂的 Tailwind 类名提取到此处，让 JSX 保持清爽
// ============================================================================

const STYLES = {
  // --- 布局容器 ---
  row: "group transition-colors duration-150 border-t-[4px] border-transparent last:border-0 hover:bg-link/10 bg-table-row",
  // 单元格内部容器：标准高度 56px (h-14)
  cell: "h-12 flex items-center",
  cellCenter: "h-12 flex items-center justify-center",
  cellStart: "h-12 flex flex-col justify-center items-start", // 用于状态列

  // --- 文本样式 ---
  textIndex: "text-xs text-gray-400",
  textMain: "text-lg font-qs-medium tracking-tight text-text-main",
  textSub: "text-sm font-qs-regular text-gray-400",
  textNoOwner: "text-gray-300 text-xs",

  // --- 组件样式 ---
  statusTag: (statusClass: string) =>
    `inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-qs-regular uppercase tracking-wide ${statusClass}`,

  lookupLink:
    "w-6 h-6 flex items-center justify-center rounded bg-table-header text-[10px] font-bold text-gray-400 hover:text-link hover:bg-link/10 transition-all uppercase",

  // Checkbox 样式生成
  checkbox: (disabled: boolean) => `
    w-3.5 h-3.5 rounded border-gray-300 text-link focus:ring-link/20 transition-all
    ${disabled ? "cursor-not-allowed opacity-40 bg-gray-100" : "cursor-pointer"}
  `,

  // 操作按钮样式生成 (续费/注册)
  actionBtn: (disabled: boolean, renewable: boolean) => `
    rounded-sm text-sm tracking-wide transition-all active:scale-95
    ${
      disabled
        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
        : renewable
          ? "bg-inherit text-link hover:text-link-hover"
          : "bg-inherit text-gray-400"
    }
  `,

  // 删除按钮样式生成
  deleteBtn: (disabled: boolean) => `
    transition-all duration-200
    ${
      disabled
        ? "text-gray-400 cursor-not-allowed opacity-50"
        : "text-link hover:text-link-hover active:scale-95"
    }
  `,
};

const STATUS_COLOR_MAP: Record<string, string> = {
  Available: "bg-green-200",
  Active: "bg-gray-200",
  Grace: "bg-red-200",
  Premium: "bg-yellow-200",
  Released: "bg-green-200",
};

// ============================================================================
// 2. 辅助函数
// ============================================================================

const formatRemainingTime = (seconds: number) => {
  if (seconds <= 0) return "已结束";
  const days = Math.floor(seconds / 86400);
  if (days > 365) return `${(days / 365).toFixed(1)}y`;
  if (days > 0) return `${days}d`;
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
};

// ============================================================================
// 3. 组件定义
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
    isSelected,
    onToggleSelection,
  }: TableRowProps) => {
    // 逻辑层保持不变
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
      <tr className={STYLES.row}>
        {/* 1. 序号列 */}
        <td className="w-14 text-center">
          <div className={STYLES.cellCenter}>
            <span className={STYLES.textIndex}>{index + 1}</span>
          </div>
        </td>

        {/* 2. 名称列 */}
        <td>
          <div className={STYLES.cell}>
            <div
              className={`flex flex-col justify-center ${
                record.wrapped
                  ? "px-1 rounded-md border border-link/30 bg-link/5"
                  : ""
              }`}
            >
              <div className="flex items-center gap-1">
                <span className={STYLES.textMain}>{record.label}</span>
                <span className={STYLES.textSub}>.eth</span>
              </div>
            </div>
          </div>
        </td>

        {/* 3. 状态与时间 */}
        <td>
          <div className={STYLES.cellStart}>
            <div className={STYLES.statusTag(statusClass)}>
              <span>{record.status}</span>
              {timeInfo && (
                <span className="pl-1 text-[10px] text-gray-400 font-qs-medium leading-none">
                  {timeInfo}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* 4. 所有者列 */}
        <td>
          <div className={STYLES.cell}>
            {record.owner ? (
              <div
                className={`flex items-center gap-2 text-sm ${
                  isMe ? "underline" : "text-text-main"
                }`}
              >
                <span
                  title={record.owner}
                  className={!record.ownerPrimaryName ? "" : "text-gray-400"}
                >
                  {record.ownerPrimaryName ||
                    `${record.owner.slice(0, 6)}...${record.owner.slice(-4)}`}
                </span>
                {isMe && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </div>
            ) : (
              <span className={STYLES.textNoOwner}>—</span>
            )}
          </div>
        </td>

        {/* 5. 信息与外部链接 */}
        <td className="text-center">
          <div className={`${STYLES.cell} gap-1.5`}>
            {availableLookups.map((item) => (
              <a
                key={item.key}
                href={item.getLink(record, chainId)}
                target="_blank"
                rel="noopener noreferrer"
                title={item.label}
                className={STYLES.lookupLink}
              >
                {item.key.slice(0, 1)}
              </a>
            ))}
          </div>
        </td>

        {/* 6. 操作 (Checkbox + 按钮) */}
        <td className="text-right">
          <div className={`${STYLES.cell} gap-2`}>
            {onToggleSelection && (
              <input
                type="checkbox"
                disabled={!isConnected}
                className={STYLES.checkbox(!isConnected)}
                checked={isSelected}
                onChange={() => onToggleSelection(record.label)}
                onClick={(e) => e.stopPropagation()}
                title={!isConnected ? "请先连接钱包" : "选择续费"}
              />
            )}

            <button
              disabled={!isConnected}
              className={STYLES.actionBtn(!isConnected, renewable)}
            >
              {isConnected ? (renewable ? "续费" : "注册") : "未连接"}
            </button>
          </div>
        </td>

        {/* 7. 删除列 */}
        <td className="text-center">
          <div className={STYLES.cellCenter}>
            <button
              disabled={!canDelete}
              className={STYLES.deleteBtn(!canDelete)}
              title={canDelete ? "删除" : "不可用"}
            >
              <FontAwesomeIcon icon={faCircleXmark} size="sm" />
            </button>
          </div>
        </td>
      </tr>
    );
  },
);
