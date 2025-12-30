import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import { usePremiumEthPrice } from "../../../hooks/usePremiumEthPrice";
import { STATUS_COLOR_BG, STATUS_COLOR_TEXT } from "../../../config/constants";
import type { NameRecord } from "../../../types/ensNames";

// 辅助函数移入组件文件或 utils
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
  // Hook 隔离在此组件内，价格变化只重渲染此单元格
  const premiumEthPrice = usePremiumEthPrice(
    record.status,
    record.releaseTime || 0,
  );

  const statusClass =
    STATUS_COLOR_BG[record.status] + " " + STATUS_COLOR_TEXT[record.status] ||
    "bg-gray-50 text-text-main border-table-border";

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
      <div
        className={`inline-flex items-center px-2.5 py-1 text-xs uppercase tracking-wide ${statusClass}`}
      >
        <span>{record.status}</span>
        {displayInfo && (
          <span className="pl-1 leading-none">{displayInfo}</span>
        )}
      </div>
    </div>
  );
};
