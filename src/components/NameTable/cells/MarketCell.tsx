// src/components/NameTable/cells/MarketCell.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../../ui/Tooltip";
import type { SimpleMarketData } from "../../../types/marketData"; // 🚀
import { displayNumber } from "../../../utils/format";

interface MarketCellProps {
  data?: SimpleMarketData;
  isLoading: boolean;
}

export const MarketCell = ({ data, isLoading }: MarketCellProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="h-12 flex flex-col justify-center items-end gap-1.5 opacity-50 px-2">
        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-2 w-8 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!data || (!data.listing && !data.offer)) {
    return (
      <div className="h-12 flex items-center justify-end px-2">
        <span className="text-gray-300 text-xs">—</span>
      </div>
    );
  }

  // 简单的 Tooltip：只显示去 OpenSea 的提示
  const tooltipContent = (
    <div className="text-xs">{t("market.view_on_opensea")}</div>
  );

  const link = data.listing?.url || data.offer?.url;

  return (
    <div className="h-12 flex flex-col justify-center items-end px-2">
      <Tooltip content={tooltipContent}>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-end group cursor-pointer"
        >
          {/* Listing */}
          {data.listing ? (
            <div className="flex items-center gap-1 text-sm font-qs-bold text-gray-900 group-hover:text-link transition-colors">
              <FontAwesomeIcon
                icon={faEthereum}
                className="text-xs opacity-70"
              />
              <span>{displayNumber(data.listing.amount)}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-300 font-qs-medium select-none">
              —
            </span>
          )}

          {/* Offer */}
          {data.offer && (
            <div className="text-[10px] font-qs-medium text-gray-400 group-hover:text-link/80 transition-colors mt-0.5">
              <span className="opacity-70 mr-1">{t("market.bid")}</span>
              {displayNumber(data.offer.amount)} {data.offer.currency}
            </div>
          )}
        </a>
      </Tooltip>
    </div>
  );
};
