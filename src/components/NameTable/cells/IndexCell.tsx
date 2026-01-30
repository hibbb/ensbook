// src/components/NameTable/cells/IndexCell.tsx

import { useTranslation } from "react-i18next";
import { Tooltip } from "../../ui/Tooltip";

interface IndexCellProps {
  index: number;
  level?: number;
  onLevelChange?: (newLevel: number) => void;
}

const LEVEL_STYLES: Record<number, string> = {
  0: "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
  1: "bg-cyan-100 text-cyan-600 border border-cyan-200 shadow-sm",
  2: "bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm",
  3: "bg-red-100 text-red-600 border border-red-200 shadow-sm",
};

export const IndexCell = ({
  index,
  level = 0,
  onLevelChange,
}: IndexCellProps) => {
  const { t } = useTranslation();
  const currentStyle = LEVEL_STYLES[level] || LEVEL_STYLES[0];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLevelChange) {
      // 保持循环逻辑：0 -> 1 -> 2 -> 3 -> 0
      onLevelChange((level + 1) % 4);
    }
  };

  return (
    <div className="h-12 w-full flex items-center justify-center">
      <Tooltip content={t("table.cell.index_tooltip")}>
        <div
          onClick={handleClick}
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
