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

const getCurrencySymbol = (currency: string) => {
  if (currency === "ETH" || currency === "WETH") return "Ξ";
  // USDC, USDT, DAI
  return "$";
};

export const MarketCell = ({ data, isLoading }: MarketCellProps) => {
  const { t } = useTranslation();

  // 1. Loading 骨架屏
  if (isLoading) {
    return (
      <div className="h-12 flex items-center justify-start gap-3 opacity-50 px-2">
        <div className="h-6 w-10 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-6 w-10 bg-gray-200 rounded-lg animate-pulse" />
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

  // 3. Tooltip 内容
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
              <span className="font-mono font-light">
                {displayNumber(data.listing.amount)}
              </span>
              <span className="ml-1 font-qs-medium text-gray-300">
                {data.listing.currency}
              </span>
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
            <span className="text-[10px] bg-purple-600/20 text-purple-300 px-1.5 py-0.5 rounded-lg border border-purple-500/30">
              Bid
            </span>
          </span>
          <div className="flex flex-col items-end">
            <span className="text-purple-300">
              <span className="font-mono font-light">
                {displayNumber(data.offer.amount)}
              </span>
              <span className="ml-1 font-qs-medium text-purple-400">
                {data.offer.currency}
              </span>
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
          {/* A. Listing Price */}
          {data.listing ? (
            <div className="flex items-center gap-1 text-xs text-text-main group-hover:text-link transition-colors">
              <span className="font-sans leading-none">
                {getCurrencySymbol(data.listing.currency)}
              </span>
              <span className="font-mono font-light">
                {displayNumber(data.listing.amount)}
              </span>
            </div>
          ) : null}

          {/* B. Offer Price */}
          {data.offer && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-purple-50 text-purple-600 text-xs group-hover:bg-purple-100 transition-colors">
              <span className="font-sans leading-none">
                {getCurrencySymbol(data.offer.currency)}
              </span>
              <span className="font-mono font-light">
                {displayNumber(data.offer.amount)}
              </span>
            </div>
          )}
        </a>
      </Tooltip>
    </div>
  );
};
