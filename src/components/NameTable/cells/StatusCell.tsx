// src/components/NameTable/cells/StatusCell.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import { usePremiumEthPrice } from "../../../hooks/usePremiumEthPrice";
import { STATUS_COLOR_BG, STATUS_COLOR_TEXT } from "../../../config/constants";
import type { NameRecord } from "../../../types/ensNames";
import { Tooltip } from "../../ui/Tooltip";

// 1. 高效的时间格式化函数
const formatDate = (timestamp: number) => {
  if (!timestamp) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp * 1000));
};

// 辅助函数：格式化剩余时间
const formatRemainingTime = (seconds: number) => {
  if (seconds <= 0) return "Over";
  const days = Math.floor(seconds / 86400);
  if (days > 365) return `${(days / 365).toFixed(1)}Y`;
  if (days > 0) return `${days}D`;
  const hours = Math.floor(seconds / 3600);
  return `${hours}H`;
};

interface StatusCellProps {
  record: NameRecord;
  now: number;
}

export const StatusCell = ({ record, now }: StatusCellProps) => {
  const premiumEthPrice = usePremiumEthPrice(
    record.status,
    record.releaseTime || 0,
  );

  const statusClass =
    STATUS_COLOR_BG[record.status] + " " + STATUS_COLOR_TEXT[record.status] ||
    "bg-gray-50 text-text-main border-table-border";

  // 2. 构建 Tooltip 内容逻辑
  const getTooltipContent = () => {
    const timePoints = [
      {
        label: "注册时间",
        // 🛠️ 修复 1: 使用 correct field name: registeredTime
        time: record.registeredTime,
        show: !!record.registeredTime,
      },
      {
        label: "过期时间",
        time: record.expiryTime,
        show: !!record.expiryTime,
      },
      {
        label: "释放时间",
        time: record.releaseTime,
        show: !!record.releaseTime,
      },
      {
        label: "当前时间",
        // 🛠️ 修复 2: 直接使用 props 传入的 now，避免 impure function 警告
        time: now,
        show: true,
        isCurrent: true,
      },
    ];

    // 如果是 Premium 状态，添加溢价结束时间 (Release + 21天)
    if (record.status === "Premium" && record.releaseTime) {
      const PREMIUM_PERIOD = 21 * 24 * 60 * 60;
      timePoints.push({
        label: "溢价结束",
        time: record.releaseTime + PREMIUM_PERIOD,
        show: true,
      });
    }

    // 过滤并排序
    const sortedPoints = timePoints
      .filter((p) => p.show && p.time && p.time > 0)
      .sort((a, b) => (a.time || 0) - (b.time || 0));

    // 3. 渲染现代化的时间轴列表
    return (
      <div className="flex flex-col px-1 py-1 gap-1 min-w-[220px]">
        {sortedPoints.map((point) => (
          <div
            key={point.label}
            className={`flex py-0.5 justify-between items-center gap-4 text-xs ${
              point.isCurrent
                ? "text-white font-qs-bold border-l-2 border-link pl-2 -ml-2.5" // 高亮当前时间
                : "text-gray-300 font-qs-medium"
            }`}
          >
            <span>{point.label}</span>
            <span className="tracking-tight opacity-90">
              {formatDate(point.time || 0)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const getStatusInfo = () => {
    if (record.status === "Premium" && premiumEthPrice) {
      return (
        <>
          <FontAwesomeIcon icon={faEthereum} /> {premiumEthPrice}
        </>
      );
    }
    if (now === 0) return null;
    if (record.status === "Active" && record.expiryTime)
      return formatRemainingTime(record.expiryTime - now);
    if (record.status === "Grace" && record.releaseTime)
      return formatRemainingTime(record.releaseTime - now);

    const PREMIUM_PERIOD = 21 * 24 * 60 * 60;
    if (record.status === "Premium" && record.releaseTime)
      return formatRemainingTime(record.releaseTime + PREMIUM_PERIOD - now);

    return null;
  };

  const displayInfo = getStatusInfo();

  return (
    <div className="h-12 flex flex-col justify-center items-start">
      <Tooltip content={getTooltipContent()}>
        <div
          className={`inline-flex items-center px-2.5 py-1 text-xs uppercase tracking-wide cursor-context-menu transition-opacity hover:opacity-90 ${statusClass}`}
        >
          <span>{record.status}</span>
          {displayInfo && (
            <span className="pl-1 leading-none">{displayInfo}</span>
          )}
        </div>
      </Tooltip>
    </div>
  );
};
