import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";

// 🎨 颜色配置：请在此处替换为您模板中的颜色
const STATUS_STYLES: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Active: "bg-blue-50 text-blue-700 border-blue-200",
  GracePeriod: "bg-amber-50 text-amber-700 border-amber-200",
  PremiumPeriod: "bg-purple-50 text-purple-700 border-purple-200",
  Released: "bg-rose-50 text-rose-700 border-rose-200",
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

  // 状态样式回退处理
  const statusClass =
    STATUS_STYLES[record.status] ||
    "bg-slate-50 text-slate-600 border-slate-200";

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} 已复制`, {
      style: { fontSize: "12px", fontWeight: 500 },
    });
  };

  return (
    <tr
      className={`group transition-colors duration-200 border-b border-gray-100 last:border-0 ${
        isMe ? "bg-blue-50/30 hover:bg-blue-50/60" : "hover:bg-gray-50/50"
      }`}
    >
      {/* 1. 序号 */}
      <td className="p-0 text-center w-14">
        <div className="px-3 py-2 h-14 flex items-center justify-center text-xs text-gray-400 font-mono">
          {index + 1}
        </div>
      </td>

      {/* 2. 名称 */}
      <td className="p-0">
        <div className="px-3 py-2 h-14 flex items-center">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-bold tracking-tight ${record.wrapped ? "text-violet-700" : "text-slate-900"}`}
              >
                {record.label}
              </span>
              <span className="text-gray-400 text-xs font-medium">.eth</span>
            </div>
            {record.wrapped && (
              <span className="mt-0.5 inline-flex text-[9px] font-bold uppercase tracking-wider text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100 w-fit">
                Wrapped
              </span>
            )}
          </div>
        </div>
      </td>

      {/* 3. 状态 */}
      <td className="p-0">
        <div className="px-3 py-2 h-14 flex items-center">
          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wide shadow-sm ${statusClass}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60`}
            />
            {record.status}
          </div>
        </div>
      </td>

      {/* 4. 所有者 */}
      <td className="p-0">
        <div className="px-3 py-2 h-14 flex items-center">
          {record.owner ? (
            <div
              className={`flex items-center gap-2 font-mono text-xs ${isMe ? "text-blue-600 font-bold" : "text-slate-500"}`}
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

      {/* 5. 元数据 */}
      <td className="p-0">
        <div className="px-3 py-2 h-14 flex flex-col justify-center gap-1">
          {["Label", "Name"].map((type) => (
            <button
              key={type}
              onClick={() =>
                handleCopy(
                  type,
                  type === "Label" ? record.labelhash : record.namehash,
                )
              }
              className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-blue-600 transition-colors group/btn text-left w-fit"
            >
              <span className="font-mono bg-gray-50 border border-gray-100 px-1 py-0.5 rounded text-gray-500 group-hover/btn:border-blue-200 group-hover/btn:bg-blue-50 group-hover/btn:text-blue-700">
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

      {/* 6. 相关信息 */}
      <td className="p-0 text-center">
        <div className="px-3 py-2 h-14 flex items-center justify-center">
          <a
            href={`https://app.ens.domains/${record.label}.eth`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
          </a>
        </div>
      </td>

      {/* 7. 操作 */}
      <td className="p-0 text-right">
        <div className="px-3 py-2 h-14 flex items-center justify-end">
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
