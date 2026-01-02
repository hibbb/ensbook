// src/components/NameTable/headers/IndexHeader.tsx

import { ThWrapper } from "./ThWrapper";
import { Tooltip } from "../../ui/Tooltip"; // 🚀 引入 Tooltip

interface IndexHeaderProps {
  totalCount: number;
  filteredCount: number;
}

export const IndexHeader = ({
  totalCount,
  filteredCount,
}: IndexHeaderProps) => {
  // 判断是否处于筛选状态
  const isFiltered = totalCount > 0 && filteredCount < totalCount;

  return (
    <ThWrapper className="justify-center">
      {/* 🚀 使用 Tooltip 包裹内容 */}
      <Tooltip
        content={
          isFiltered ? `显示: ${filteredCount} / 总计: ${totalCount}` : "总行数"
        }
      >
        {isFiltered ? (
          // 筛选状态：显示 筛选数 / 总数 (横向排列)
          <div
            className="flex items-center justify-center gap-0.5 text-xs font-qs-medium animate-in zoom-in duration-200 whitespace-nowrap"
            // ❌ 移除 title
          >
            {/* 分子：高亮显示 */}
            <span className="text-link font-bold">{filteredCount}</span>
            {/* 分隔符 */}
            <span className="text-gray-300 font-normal">/</span>
            {/* 分母：灰色显示 */}
            <span className="text-gray-400 font-normal">{totalCount}</span>
          </div>
        ) : (
          // 默认状态：显示总数 或 #
          <span
            className="text-xs text-gray-400 font-qs-medium"
            // ❌ 移除 title
          >
            {totalCount > 0 ? totalCount : "#"}
          </span>
        )}
      </Tooltip>
    </ThWrapper>
  );
};
