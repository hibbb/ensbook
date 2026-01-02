// src/components/NameTable/cells/NameCell.tsx

import { useMemo } from "react";
import { namehash, keccak256, stringToBytes } from "viem";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { faFileLines } from "@fortawesome/free-regular-svg-icons";

import type { NameRecord } from "../../../types/ensNames";
import { MemoEditor } from "../../MemoEditor";
import { Tooltip } from "../../ui/Tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/Popover";

interface NameCellProps {
  record: NameRecord;
}

// 辅助组件：元数据行
const MetadataRow = ({
  label,
  value,
  fullValue,
}: {
  label: string;
  value: string;
  fullValue?: string;
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(fullValue || value);
    toast.success(`已复制 ${label}`);
  };

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 font-qs-medium">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-gray-700">{value}</span>
        {fullValue && (
          <button
            onClick={handleCopy}
            className="text-gray-300 hover:text-link transition-colors p-1 rounded-md hover:bg-gray-50"
            title="复制完整值"
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        )}
      </div>
    </div>
  );
};

export const NameCell = ({ record }: NameCellProps) => {
  // 🚀 计算元数据 (使用 useMemo 避免不必要的重算)
  const metadata = useMemo(() => {
    try {
      const fullName = `${record.label}.eth`;
      const labelHashHex = keccak256(stringToBytes(record.label));
      const nameHashHex = namehash(fullName);

      const labelHashDec = BigInt(labelHashHex).toString();
      const nameHashDec = BigInt(nameHashHex).toString();

      // 截断辅助函数
      const truncate = (str: string, len = 6) =>
        `${str.slice(0, len)}...${str.slice(-4)}`;

      return {
        length: record.label.length,
        nameHashHex,
        nameHashDec,
        labelHashHex,
        labelHashDec,
        // 显示用的截断值
        display: {
          nameHashHex: truncate(nameHashHex),
          nameHashDec: truncate(nameHashDec),
          labelHashHex: truncate(labelHashHex),
          labelHashDec: truncate(labelHashDec),
        },
      };
    } catch (e) {
      console.error("Hash calculation failed", e);
      return null;
    }
  }, [record.label]);

  return (
    <div className="h-12 flex items-center">
      <div className="flex items-center gap-2">
        {/* 1. 域名链接 */}
        <Tooltip content="在 ENS 官网查看详情">
          <a
            href={`https://app.ens.domains/${record.label}.eth`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 group"
          >
            {record.wrapped && (
              <span className="text-sm font-qs-regular text-link">{"["}</span>
            )}
            <span className="text-base font-qs-medium tracking-tight text-text-main group-hover:text-link transition-colors">
              {record.label}
            </span>
            <span className="text-sm font-qs-regular text-gray-400">.eth</span>
            {record.wrapped && (
              <span className="text-sm font-qs-regular text-link">{"]"}</span>
            )}
          </a>
        </Tooltip>

        {/* 🚀 2. 元数据 Popover (新增) */}
        {metadata && (
          <Popover>
            <Tooltip content="点击查看元数据">
              <PopoverTrigger asChild>
                <button className="text-gray-300 hover:text-link transition-colors outline-none">
                  <FontAwesomeIcon icon={faFileLines} size="xs" />
                </button>
              </PopoverTrigger>
            </Tooltip>

            <PopoverContent className="w-80 p-0 overflow-hidden" align="start">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-qs-bold text-gray-500 uppercase tracking-wider">
                  Metadata
                </span>
                <span className="text-xs font-qs-medium text-gray-400">
                  {record.label}.eth
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-qs-medium">Length:</span>
                  <span className="font-mono text-gray-700 font-bold">
                    {metadata.length}
                  </span>
                </div>

                <MetadataRow
                  label="Namehash (Hex)"
                  value={metadata.display.nameHashHex}
                  fullValue={metadata.nameHashHex}
                />
                <MetadataRow
                  label="Namehash (Dec)"
                  value={metadata.display.nameHashDec}
                  fullValue={metadata.nameHashDec}
                />
                <MetadataRow
                  label="Labelhash (Hex)"
                  value={metadata.display.labelHashHex}
                  fullValue={metadata.labelHashHex}
                />
                <MetadataRow
                  label="Labelhash (Dec)"
                  value={metadata.display.labelHashDec}
                  fullValue={metadata.labelHashDec}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* 3. 备注编辑器 */}
        <MemoEditor label={record.label} />
      </div>
    </div>
  );
};
