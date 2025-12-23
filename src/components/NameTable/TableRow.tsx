import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";

const STATUS_STYLES: Record<string, string> = {
  Available: "bg-green-200",
  Active: "bg-gray-200",
  Grace: "bg-red-200",
  Premium: "bg-yellow-200",
  Released: "bg-green-200",
};

// 🚀 辅助函数：格式化剩余时间
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
  currentAddress?: string;
  isConnected: boolean;
}

export const TableRow = ({
  record,
  index,
  currentAddress,
  isConnected,
}: TableRowProps) => {
  const isMe =
    currentAddress &&
    record.owner?.toLowerCase() === currentAddress.toLowerCase();
  const renewable = isRenewable(record);

  const statusClass =
    STATUS_STYLES[record.status] || "bg-gray-50 text-gray-600 border-gray-200";

  // 🚀 逻辑处理：根据状态计算目标剩余时间
  const getTimeInfo = () => {
    const now = Math.floor(Date.now() / 1000);
    const PREMIUM_PERIOD = 21 * 24 * 60 * 60; // 90天宽限期

    if (record.status === "Active" && record.expiryTime) {
      return formatRemainingTime(record.expiryTime - now);
    }
    if (record.status === "Grace" && record.releaseTime) {
      return formatRemainingTime(record.releaseTime - now);
    }
    if (record.status === "Premium" && record.releaseTime) {
      return formatRemainingTime(record.releaseTime + PREMIUM_PERIOD - now);
    }
    return null;
  };

  const timeInfo = getTimeInfo();

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} 已复制`, {
      style: { fontSize: "12px", fontWeight: 500 },
    });
  };

  return (
    <tr className="group transition-colors bg-table-row duration-150 last:border-0 hover:bg-link/10">
      <td className="w-14 text-center">
        <div className="h-14 flex items-center justify-center text-xs text-gray-400">
          {index + 1}
        </div>
      </td>

      <td>
        <div className="h-14 flex items-center">
          <div
            className={`flex flex-col justify-center ${record.wrapped ? "px-1 rounded-md border border-link/30 bg-link/10" : ""}`}
          >
            <div className="flex items-center gap-1">
              <span className="text-base font-qs-semibold tracking-tight">
                {record.label}
              </span>
              <span className="text-sm font-qs-regular text-gray-400">
                .eth
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* 🚀 状态单元格：增加时间信息逻辑 */}
      <td>
        <div className="h-14 flex flex-col justify-center items-start">
          <div
            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-qs-regular uppercase tracking-wide ${statusClass}`}
          >
            <span>{record.status}</span>
            {timeInfo && (
              <span className="pl-1 text-[10px] text-gray-400 text-center font-qs-medium leading-none w-full">
                {timeInfo}
              </span>
            )}
          </div>
        </div>
      </td>

      <td>
        <div className="h-14 flex items-center">
          {record.owner ? (
            <div
              className={`flex items-center gap-2 text-xs ${isMe ? "text-blue-600 font-bold" : "text-gray-500"}`}
            >
              {`${record.owner.slice(0, 6)}...${record.owner.slice(-4)}`}
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
              <span className="bg-gray-50 border border-gray-100 px-1 py-0.5 rounded text-gray-500 group-hover/btn:border-blue-200 group-hover/btn:bg-blue-50 group-hover/btn:text-blue-700">
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

      <td className="text-center">
        <div className="h-14 flex items-center justify-center">
          <a
            href={`https://app.ens.domains/${record.label}.eth`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-link hover:bg-blue-50 transition-all"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
          </a>
        </div>
      </td>

      <td className="text-right">
        <div className="h-14 flex items-center justify-end">
          <button
            disabled={!isConnected}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all shadow-sm active:scale-95 ${
              !isConnected
                ? "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
                : renewable
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-100 hover:shadow-md border border-transparent"
                  : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
            }`}
          >
            {isConnected ? (renewable ? "续费" : "注册") : "连接"}
          </button>
        </div>
      </td>
    </tr>
  );
};
