// src/components/NameTable/cells/IndexCell.tsx

import { Tooltip } from "../../ui/Tooltip";

interface IndexCellProps {
  index: number;
  level?: number; // 允许 undefined
  onLevelChange?: (newLevel: number) => void;
}

// 🚀 优化样式：加深背景色，增强视觉反馈
const LEVEL_STYLES: Record<number, string> = {
  0: "text-gray-400 hover:bg-gray-100 hover:text-gray-600", // Default: 灰色交互
  1: "bg-cyan-100 text-cyan-600 border border-cyan-200 shadow-sm", // Cyan: 关注蓝
  2: "bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm", // Yellow: 警示黄
  3: "bg-red-100 text-red-600 border border-red-200 shadow-sm", // Red: 紧急红
};

export const IndexCell = ({
  index,
  level = 0, // 默认值为 0
  onLevelChange,
}: IndexCellProps) => {
  const currentStyle = LEVEL_STYLES[level] || LEVEL_STYLES[0];

  // 单击：0 -> 1 -> 2 -> 3 -> 0
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发行点击
    if (onLevelChange) {
      onLevelChange((level + 1) % 4);
    }
  };

  // 双击：重置为 0
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLevelChange) {
      onLevelChange(0);
    }
  };

  return (
    <div className="h-12 w-full flex items-center justify-center">
      <Tooltip content="单击切换级别 / 双击重置">
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          // 🚀 核心交互优化：
          // 1. select-none: 防止狂点时选中文字
          // 2. active:scale-90: 点击时明显缩一下，提供物理触感反馈
          // 3. transition-all: 平滑过渡
          className={`
            w-5 h-5 flex items-center justify-center rounded-full
            text-xs font-qs-bold cursor-pointer select-none
            transition-all duration-100
            hover:scale-110 active:scale-90
            ${currentStyle}
          `}
        >
          {index + 1}
        </div>
      </Tooltip>
    </div>
  );
};
