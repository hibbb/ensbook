// src/components/NameTable/cells/OwnerCell.tsx

import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser, faCopy } from "@fortawesome/free-regular-svg-icons";
import type { NameRecord } from "../../../types/ensNames";
import { Tooltip } from "../../ui/Tooltip";

interface OwnerCellProps {
  record: NameRecord;
  currentAddress?: string;
}

export const OwnerCell = ({ record, currentAddress }: OwnerCellProps) => {
  const isMe =
    currentAddress &&
    record.owner?.toLowerCase() === currentAddress.toLowerCase();

  // 复制处理函数
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`已复制 ${label}`);
  };

  // 构建富文本 Tooltip 内容
  const renderTooltipContent = () => {
    // 1. 在渲染前进行空值检查
    if (!record.owner) return null;

    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        {/* 所有者地址 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-qs-semibold">
              Owner Address
            </span>
            <span className="font-qs-medium text-xs">
              {record.owner.slice(0, 6)}...{record.owner.slice(-4)}
            </span>
          </div>
          <button
            // 🚀 修复：使用 record.owner! 断言，因为上方已检查 if (!record.owner)
            onClick={() => handleCopy(record.owner!, "地址")}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Copy Address"
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>

        {/* 主名称 (如果有) */}
        {record.ownerPrimaryName && (
          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-qs-semibold">
                Primary Name
              </span>
              <span className="font-qs-medium text-xs">
                {record.ownerPrimaryName}
              </span>
            </div>
            <button
              // 🚀 修复：同样使用 ! 断言，因为 record.ownerPrimaryName 可能是 undefined
              onClick={() => handleCopy(record.ownerPrimaryName!, "主名称")}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Copy Primary Name"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-12 flex items-center">
      {record.owner ? (
        <div
          className={`flex items-center gap-2 text-sm ${isMe ? "" : "text-text-main"}`}
        >
          <Tooltip content={renderTooltipContent()}>
            <span
              className={`cursor-default ${record.ownerPrimaryName ? "" : "text-gray-400"}`}
            >
              {record.ownerPrimaryName ||
                `${record.owner.slice(0, 6)}...${record.owner.slice(-4)}`}
            </span>
          </Tooltip>
          {isMe && (
            // 🚀 新增：为所有者图标添加 Tooltip
            <Tooltip content="这是我的名称">
              <span className="flex h-2 w-2 relative text-gray-400">
                <FontAwesomeIcon icon={faCircleUser} size="xs" />
              </span>
            </Tooltip>
          )}
        </div>
      ) : (
        <span className="text-gray-300 text-xs">—</span>
      )}
    </div>
  );
};
