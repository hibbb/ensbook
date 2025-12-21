import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../../utils/ens"; //
import type { NameRecord } from "../../types/ensNames"; //

// 将样式映射移出组件，提升性能
const STATUS_CLASSES: Record<string, string> = {
  Available: "bg-green-50 text-green-700 border-green-200",
  Active: "bg-blue-50 text-blue-700 border-blue-200",
  GracePeriod: "bg-orange-50 text-orange-700 border-orange-200",
  PremiumPeriod: "bg-purple-50 text-purple-700 border-purple-200",
  Released: "bg-red-50 text-red-700 border-red-200",
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

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} 已复制`);
  };

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${isMe ? "bg-amber-50" : "even:bg-slate-50/50"}`}
    >
      {/* 序号 */}
      <td className="px-6 py-4 text-sm text-gray-400 font-mono">{index + 1}</td>

      {/* 名称 */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold ${record.wrapped ? "text-purple-600" : "text-gray-900"}`}
          >
            {record.label}
            <span className="text-gray-400 font-normal">.eth</span>
          </span>
          {record.wrapped && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-600 border border-purple-200">
              Wrapped
            </span>
          )}
        </div>
      </td>

      {/* 状态 */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CLASSES[record.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}
        >
          {record.status}
        </span>
      </td>

      {/* 所有者 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
        {record.owner ? (
          <div
            className={`flex items-center gap-2 ${isMe ? "text-amber-600 font-bold" : "text-gray-500"}`}
          >
            {`${record.owner.slice(0, 6)}...${record.owner.slice(-4)}`}
            {isMe && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 border border-amber-200">
                ME
              </span>
            )}
          </div>
        ) : (
          "-"
        )}
      </td>

      {/* 元数据 */}
      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
        <div className="flex flex-col gap-1">
          {["Label", "Name"].map((type) => (
            <button
              key={type}
              onClick={() =>
                handleCopy(
                  type,
                  type === "Label" ? record.labelhash : record.namehash,
                )
              }
              className="flex items-center gap-2 hover:text-blue-600 transition-colors text-left group w-fit"
            >
              <FontAwesomeIcon
                icon={faCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span className="bg-gray-100 px-1.5 py-0.5 rounded uppercase text-[10px] group-hover:bg-blue-50 group-hover:text-blue-600">
                {type}:{" "}
                {record[type === "Label" ? "labelhash" : "namehash"].slice(
                  0,
                  4,
                )}
                ...
              </span>
            </button>
          ))}
        </div>
      </td>

      {/* 相关信息 */}
      <td className="px-6 py-4 text-gray-300">
        <FontAwesomeIcon
          icon={faExternalLinkAlt}
          size="xs"
          className="hover:text-blue-500 cursor-pointer transition-colors"
        />
      </td>

      {/* 操作 */}
      <td className="px-6 py-4 text-right">
        <button
          disabled={!isConnected}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            !isConnected
              ? "bg-gray-100 text-gray-400 border shadow-none cursor-not-allowed"
              : renewable
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5"
                : "bg-white border border-green-500 text-green-600 hover:bg-green-50 hover:-translate-y-0.5"
          }`}
        >
          {isConnected ? (renewable ? "续费" : "注册") : "连接钱包"}
        </button>
      </td>
    </tr>
  );
};
