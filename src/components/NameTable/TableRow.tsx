import { memo } from "react";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../../utils/ens";
import { getAvailableLookups } from "../../utils/lookupProvider";
import type { NameRecord } from "../../types/ensNames";

const STATUS_STYLES: Record<string, string> = {
  Available: "bg-green-200",
  Active: "bg-gray-200",
  Grace: "bg-red-200",
  Premium: "bg-yellow-200",
  Released: "bg-green-200",
};

const formatRemainingTime = (seconds: number) => {
  if (seconds <= 0) return "已结束";
  const days = Math.floor(seconds / 86400);
  if (days > 365) return `${(days / 365).toFixed(1)}y`;
  if (days > 0) return `${days}d`;
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
};

interface TableRowProps {
  record: NameRecord;
  index: number;
  now: number;
  currentAddress?: string;
  isConnected: boolean;
  chainId?: number;
  canDelete?: boolean; // 新增：控制删除列
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
  }: TableRowProps) => {
    const isMe =
      currentAddress &&
      record.owner?.toLowerCase() === currentAddress.toLowerCase();

    const renewable = isRenewable(record.status);

    const statusClass =
      STATUS_STYLES[record.status] ||
      "bg-gray-50 text-text-main border-table-border";

    const availableLookups = getAvailableLookups(record, chainId);

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

    const handleCopy = (label: string, value: string) => {
      navigator.clipboard.writeText(value);
      toast.success(`${label} 已复制`, { style: { fontSize: "12px" } });
    };

    return (
      <tr className="group transition-colors duration-150 border-t-[4px] border-transparent last:border-0 hover:bg-link/10 bg-table-row">
        {/* 序号列 */}
        <td className="w-14 text-center">
          <div className="h-14 flex items-center justify-center">
            <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
          </div>
        </td>

        {/* 名称列 */}
        <td>
          <div className="h-14 flex items-center">
            <div
              className={`flex flex-col justify-center ${record.wrapped ? "px-1 rounded-md border border-link/30 bg-link/5" : ""}`}
            >
              <div className="flex items-center gap-1">
                <span className="text-base font-qs-semibold tracking-tight text-text-main">
                  {record.label}
                </span>
                <span className="text-sm font-qs-regular text-gray-400">
                  .eth
                </span>
              </div>
            </div>
          </div>
        </td>

        {/* 状态与时间 */}
        <td>
          <div className="h-14 flex flex-col justify-center items-start">
            <div
              className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-qs-regular uppercase tracking-wide ${statusClass}`}
            >
              <span>{record.status}</span>
              {timeInfo && (
                <span className="pl-1 text-[10px] text-gray-400 font-qs-medium leading-none">
                  {timeInfo}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* 所有者列 */}
        <td>
          <div className="h-14 flex items-center">
            {record.owner ? (
              <div
                className={`flex items-center gap-2 text-xs ${isMe ? "text-blue-600 font-bold" : "text-gray-500"}`}
              >
                <span title={record.owner}>
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
              <span className="text-gray-300 text-xs">—</span>
            )}
          </div>
        </td>

        {/* 元数据 */}
        <td>
          <div className="h-14 flex flex-col justify-center gap-1">
            {["Label", "Name"].map((type) => (
              <button
                key={type}
                onClick={() =>
                  handleCopy(
                    type,
                    type === "Label" ? record.labelhash : record.namehash,
                  )
                }
                className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-link transition-colors group/btn text-left w-fit"
              >
                <span className="bg-gray-50 border border-table-border px-1 py-0.5 rounded text-gray-500 group-hover/btn:border-link/30 group-hover/btn:bg-link/5 group-hover/btn:text-link-hover">
                  {type[0]}H:{" "}
                  {record[type === "Label" ? "labelhash" : "namehash"].slice(
                    0,
                    4,
                  )}
                  ...
                </span>
                <FontAwesomeIcon
                  icon={faCopy}
                  className="opacity-0 group-hover/btn:opacity-100 transition-opacity"
                />
              </button>
            ))}
          </div>
        </td>

        {/* 信息与外部链接 */}
        <td className="text-center">
          <div className="h-14 flex items-center justify-center gap-1.5">
            {availableLookups.map((item) => (
              <a
                key={item.key}
                href={item.getLink(record, chainId)}
                target="_blank"
                rel="noopener noreferrer"
                title={item.label}
                className="w-6 h-6 flex items-center justify-center rounded bg-table-header text-[10px] font-bold text-gray-400 hover:text-link hover:bg-link/10 transition-all uppercase"
              >
                {item.key.slice(0, 1)}
              </a>
            ))}
          </div>
        </td>

        {/* 操作 */}
        <td className="text-right">
          <div className="h-14 flex items-center justify-end">
            <button
              disabled={!isConnected}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all shadow-sm active:scale-95 ${
                !isConnected
                  ? "bg-gray-50 text-gray-300 border border-table-border cursor-not-allowed"
                  : renewable
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-100 border border-transparent"
                    : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              {isConnected ? (renewable ? "续费" : "注册") : "连接"}
            </button>
          </div>
        </td>

        {/* 删除列：功能保留，样式一致 */}
        <td className="text-center">
          <div className="h-14 flex items-center justify-center">
            <button
              disabled={!canDelete}
              className={`transition-all duration-200 ${
                canDelete
                  ? "text-link hover:text-blue-700 active:scale-90"
                  : "text-gray-400 cursor-not-allowed opacity-50"
              }`}
              title={canDelete ? "删除" : "不可用"}
            >
              <FontAwesomeIcon icon={faTrash} size="sm" />
            </button>
          </div>
        </td>
      </tr>
    );
  },
);
