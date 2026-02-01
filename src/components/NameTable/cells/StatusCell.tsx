// src/components/NameTable/cells/StatusCell.tsx

import { useTranslation } from "react-i18next";
import { usePremiumEthPrice } from "../../../hooks/usePremiumEthPrice";
import {
  PREMIUM_PERIOD_DURATION,
  STATUS_COLOR_BG,
  STATUS_COLOR_TEXT,
} from "../../../config/constants";
import type { NameRecord } from "../../../types/ensNames";
import { Tooltip } from "../../ui/Tooltip";
import { formatDate } from "../../../utils/format";

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
  const { t } = useTranslation();
  const bgClass = STATUS_COLOR_BG[record.status] || "bg-gray-50";
  const textClass = STATUS_COLOR_TEXT[record.status] || "text-text-main";
  const statusClass = `${bgClass} ${textClass} border-table-border`;

  const getTooltipContent = () => {
    if (record.status === "Unknown") {
      return (
        <div className="px-2 py-1 text-xs text-gray-300">
          {t("table.cell.unknown_status")}
        </div>
      );
    }

    const timePoints = [
      {
        label: t("table.cell.reg_time"),
        time: record.registeredTime,
        show: !!record.registeredTime,
      },
      {
        label: t("table.cell.exp_time"),
        time: record.expiryTime,
        show: !!record.expiryTime,
      },
      {
        label: t("table.cell.release_time"),
        time: record.releaseTime,
        show: !!record.releaseTime,
      },
      {
        label: t("table.cell.current_time"),
        time: now,
        show: true,
        isCurrent: true,
      },
    ];

    if (record.status === "Premium" && record.releaseTime) {
      timePoints.push({
        label: t("table.cell.premium_end"),
        time: record.releaseTime + PREMIUM_PERIOD_DURATION,
        show: true,
      });
    }

    const sortedPoints = timePoints
      .filter((p) => p.show && p.time && p.time > 0)
      .sort((a, b) => (a.time || 0) - (b.time || 0));

    return (
      <div className="flex flex-col px-1 py-1 gap-1 min-w-[220px]">
        {sortedPoints.map((point) => (
          <div
            key={point.label}
            className={`flex py-0.5 justify-between items-center gap-4 text-xs ${
              point.isCurrent
                ? "text-white font-sans font-semibold border-l-2 border-link pl-2 -ml-2.5"
                : "text-gray-300 font-sans font-medium"
            }`}
          >
            <span>{point.label}</span>
            <span className="tracking-tight opacity-90 font-mono font-light">
              {formatDate(point.time || 0)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const premiumEthPrice = usePremiumEthPrice(
    record.status,
    record.releaseTime || 0,
    now,
  );

  const renderContent = () => {
    if (record.status === "Unknown") return <span>{t("common.unknown")}</span>;

    if (record.status === "Premium") {
      const remaining = record.releaseTime
        ? formatRemainingTime(
            record.releaseTime + PREMIUM_PERIOD_DURATION - now,
          )
        : "";

      return (
        <div className="flex items-center gap-1 font-sans">
          <div className="flex items-center gap-1 text-[11px]">
            <span className="leading-none">Ξ</span>
            <span className="font-mono">{premiumEthPrice || "-"}</span>
          </div>
          <span className="opacity-50 text-[10px]">|</span>
          <span className="font-mono font-light text-[10px] opacity-90">
            {remaining}
          </span>
        </div>
      );
    }

    const remainingTime = (() => {
      if (now === 0) return null;
      if (record.status === "Active" && record.expiryTime)
        return formatRemainingTime(record.expiryTime - now);
      if (record.status === "Grace" && record.releaseTime)
        return formatRemainingTime(record.releaseTime - now);
      return null;
    })();

    return (
      <>
        {/* 🚀 翻译状态文本 */}
        <span>{t(`status.${record.status.toLowerCase()}`)}</span>
        {remainingTime && (
          <span className="leading-none ml-1.5 font-mono opacity-80 border-l border-current pl-1.5 text-[10px]">
            {remainingTime}
          </span>
        )}
      </>
    );
  };

  return (
    <div className="h-12 flex flex-col justify-center items-start">
      <Tooltip content={getTooltipContent()}>
        <div
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs uppercase tracking-wide cursor-default transition-opacity hover:opacity-90 ${statusClass}`}
        >
          {renderContent()}
        </div>
      </Tooltip>
    </div>
  );
};
