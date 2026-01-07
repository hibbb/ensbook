// src/components/NameTable/cells/LookupsCell.tsx

import { getAvailableLookups } from "../../../utils/lookupProvider";
import type { NameRecord } from "../../../types/ensNames";
import { Tooltip } from "../../ui/Tooltip";

interface LookupsCellProps {
  record: NameRecord;
  chainId?: number;
}

export const LookupsCell = ({ record, chainId }: LookupsCellProps) => {
  const availableLookups = getAvailableLookups(record, chainId);

  return (
    <div className="h-12 flex items-center justify-start gap-1.5">
      {availableLookups.map((item) => (
        <Tooltip key={item.key} content={item.getLabel(record)}>
          <a
            href={item.getLink(record, chainId)}
            target="_blank"
            rel="noopener noreferrer"
            // 🚀 样式变更：
            // 1. 移除 bg-link (不再需要统一背景色，或者改为 bg-gray-100 这种淡色)
            // 2. 移除 text-white
            // 3. 保留 hover 效果 (改为 hover:scale-110 或 hover:opacity-80)
            // 4. 增加 rounded-full 让图标看起来更圆润
            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-white transition-all hover:scale-110 overflow-hidden border border-gray-300 opacity-45 hover:opacity-100"
          >
            {/* 🚀 插入图片 */}
            <img
              src={item.icon}
              alt={item.key}
              className="w-4 h-4 object-contain" // 控制图片大小，contain 保证不拉伸
            />
          </a>
        </Tooltip>
      ))}
    </div>
  );
};
