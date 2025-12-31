// src/components/NameTable/headers/IndexHeader.tsx

import { ThWrapper } from "./ThWrapper";

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
      {isFiltered ? (
        // 筛选状态：显示 筛选数 / 总数 (横向排列)
        <div
          className="flex items-center justify-center gap-0.5 text-xs font-qs-medium animate-in zoom-in duration-200 whitespace-nowrap"
          title={`显示: ${filteredCount} / 总计: ${totalCount}`}
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
        <span className="text-xs text-gray-400 font-qs-medium" title="总行数">
          {totalCount > 0 ? totalCount : "#"}
        </span>
      )}
    </ThWrapper>
  );
};
