// src/components/NameTable/cells/MarketCell.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../../ui/Tooltip";
import type { SimpleMarketData } from "../../../types/marketData";
import { displayNumber } from "../../../utils/format";

interface MarketCellProps {
  data?: SimpleMarketData;
  isLoading: boolean;
}

export const MarketCell = ({ data, isLoading }: MarketCellProps) => {
  const { t } = useTranslation();

  // 1. Loading 骨架屏
  if (isLoading) {
    return (
      <div className="h-12 flex items-center justify-start gap-3 opacity-50 px-2">
        <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // 2. 空状态
  if (!data || (!data.listing && !data.offer)) {
    return (
      <div className="h-12 flex items-center justify-start px-2">
        <span className="text-gray-300 text-xs">—</span>
      </div>
    );
  }

  // 3. Tooltip 内容 (保持不变)
  const renderTooltip = () => (
    <div className="flex flex-col gap-2 min-w-[180px] p-1">
      {/* Listing Detail */}
      {data.listing ? (
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 font-qs-medium flex items-center gap-1.5">
            <FontAwesomeIcon icon={faTag} size="xs" />
            {t("market.listed")}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-white">
              {displayNumber(data.listing.amount)} {data.listing.currency}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic">
          {t("market.no_listing")}
        </div>
      )}

      {/* Offer Detail */}
      {data.offer && (
        <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
          <span className="text-gray-400 font-qs-medium flex items-center gap-1.5">
            <span className="text-[10px] bg-purple-600/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
              Bid
            </span>
          </span>
          <div className="flex flex-col items-end">
            <span className="text-purple-300 font-qs-medium">
              {displayNumber(data.offer.amount)} {data.offer.currency}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-12 flex items-center justify-start px-2">
      <Tooltip content={renderTooltip()}>
        <a
          href={data.listing?.url || data.offer?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group cursor-pointer"
          onClick={(e) => {
            if (!data.listing?.url && !data.offer?.url) e.preventDefault();
          }}
        >
          {/* A. Listing Price (Primary) */}
          {data.listing ? (
            <div className="flex items-center gap-0.5 text-sm font-qs-bold text-gray-900 group-hover:text-link transition-colors">
              <span className="font-sans leading-none">Ξ</span>
              <span>{displayNumber(data.listing.amount)}</span>
            </div>
          ) : null}

          {/* B. Offer Price (Badge Style) */}
          {data.offer && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-xs group-hover:bg-purple-100 transition-colors">
              <span className="font-sans leading-none">Ξ</span>
              <span>{displayNumber(data.offer.amount)}</span>
            </div>
          )}
        </a>
      </Tooltip>
    </div>
  );
};
