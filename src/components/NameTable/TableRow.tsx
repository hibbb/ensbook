// src/components/NameTable/TableRow.tsx

import { useRef, useEffect, useState } from "react";
import type { NameRecord } from "../../types/ensNames";

import { IndexCell } from "./cells/IndexCell";
import { NameCell } from "./cells/NameCell";
import { StatusCell } from "./cells/StatusCell";
import { OwnerCell } from "./cells/OwnerCell";
import { MarketCell } from "./cells/MarketCell";
import { ActionCell } from "./cells/ActionCell";
import { LookupsCell } from "./cells/LookupsCell";
import { ControlCell } from "./cells/ControlCell";

import { useMarketData } from "../../hooks/useMarketData"; // 🚀 新增引入

interface TableRowProps {
  record: NameRecord;
  index: number;
  now: number;
  isConnected: boolean;
  onDelete?: (record: NameRecord) => void;
  onAddToHome?: (record: NameRecord) => void;
  isSelected?: boolean;
  onToggleSelection?: (label: string) => void;
  onRegister?: (record: NameRecord) => void;
  onRenew?: (record: NameRecord) => void;
  onReminder?: (record: NameRecord) => void;
  isPending?: boolean;
  onLevelChange?: (record: NameRecord, newLevel: number) => void;
  isOwnerColumnReadOnly?: boolean;
  showCollectionTags?: boolean;
}

export const TableRow = ({
  record,
  index,
  now,
  isConnected,
  onDelete,
  onAddToHome,
  isSelected,
  onToggleSelection,
  onRegister,
  onRenew,
  onReminder,
  isPending = false,
  onLevelChange,
  isOwnerColumnReadOnly,
  showCollectionTags,
}: TableRowProps) => {
  // 🚀 懒加载逻辑：Intersection Observer
  const rowRef = useRef<HTMLTableRowElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // 一旦进入过可视区域，就断开观察，保持数据加载状态
          if (rowRef.current) observer.unobserve(rowRef.current);
        }
      },
      { rootMargin: "200px" }, // 提前 200px 触发加载，体验更平滑
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 🚀 将市场数据的获取下放到每一行
  const { data: marketData, isLoading: isMarketLoading } = useMarketData(
    record,
    isVisible,
  );

  return (
    <tr
      ref={rowRef}
      className="group transition-colors duration-150 last:border-0 hover:bg-cyan-50 bg-table-row"
    >
      <td className="w-14 text-center">
        <IndexCell
          index={index}
          level={record.level || 0}
          onLevelChange={(newLevel) => onLevelChange?.(record, newLevel)}
        />
      </td>

      <td>
        <NameCell record={record} showCollectionTags={showCollectionTags} />
      </td>

      <td>
        <StatusCell record={record} now={now} />
      </td>

      <td>
        <OwnerCell record={record} disableLink={isOwnerColumnReadOnly} />
      </td>

      <td>
        <MarketCell
          data={marketData || undefined}
          isLoading={isMarketLoading && isVisible} // 只有可见时才显示 loading 动画
          status={record.status}
        />
      </td>

      <td className="text-right">
        <ActionCell
          record={record}
          isConnected={isConnected}
          isPending={isPending}
          isSelected={isSelected}
          onToggleSelection={onToggleSelection}
          onRegister={onRegister}
          onRenew={onRenew}
          onReminder={onReminder}
        />
      </td>

      <td className="text-center">
        <LookupsCell record={record} />
      </td>

      <td className="text-center">
        <ControlCell
          record={record}
          onDelete={onDelete}
          onAddToHome={onAddToHome}
        />
      </td>
    </tr>
  );
};
