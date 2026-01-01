// src/components/NameTable/cells/NameCell.tsx

import type { NameRecord } from "../../../types/ensNames";
import { MemoEditor } from "../../MemoEditor";
import { Tooltip } from "../../ui/Tooltip"; // 引入新组件

interface NameCellProps {
  record: NameRecord;
}

export const NameCell = ({ record }: NameCellProps) => {
  return (
    <div className="h-12 flex items-center">
      <div className="flex items-center gap-2">
        {/* 使用 Tooltip 包裹链接 */}
        <Tooltip content="在 ENS 官网查看详情">
          <a
            href={`https://app.ens.domains/${record.label}.eth`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5"
          >
            {record.wrapped && (
              <span className="text-sm font-qs-regular text-link">{"["}</span>
            )}
            <span className="text-base font-qs-medium tracking-tight text-text-main">
              {record.label}
            </span>
            <span className="text-sm font-qs-regular text-gray-400">.eth</span>
            {record.wrapped && (
              <span className="text-sm font-qs-regular text-link">{"]"}</span>
            )}
          </a>
        </Tooltip>

        {/* 🚀 备注编辑器 */}
        <MemoEditor label={record.label} />
      </div>
    </div>
  );
};
