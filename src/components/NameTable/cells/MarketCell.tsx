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

  // 1. Loading 骨架屏：改为左对齐，横向排列
  if (isLoading) {
    return (
      <div className="h-12 flex items-center justify-start gap-3 opacity-50 px-2">
        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // 2. 空状态：改为左对齐
  if (!data || (!data.listing && !data.offer)) {
    return (
      <div className="h-12 flex items-center justify-start px-2">
        <span className="text-gray-300 text-xs">—</span>
      </div>
    );
  }

  // 3. Tooltip 内容 (保持不变，这里用 Icon 没问题)
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
            <span className="text-white font-qs-semibold">
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
            <span className="text-[10px] bg-gray-700 px-1 rounded">Bid</span>
          </span>
          <div className="flex flex-col items-end">
            <span className="text-gray-300 font-qs-medium">
              {displayNumber(data.offer.amount)} {data.offer.currency}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    // 🚀 样式调整：justify-start (左对齐)
    <div className="h-12 flex items-center justify-start px-2">
      <Tooltip content={renderTooltip()}>
        <a
          href={data.listing?.url || data.offer?.url}
          target="_blank"
          rel="noopener noreferrer"
          // 🚀 样式调整：flex-row (横向), gap-3 (间距)
          className="flex items-center gap-3 group cursor-pointer"
          onClick={(e) => {
            if (!data.listing?.url && !data.offer?.url) e.preventDefault();
          }}
        >
          {/* A. Listing Price */}
          {data.listing ? (
            <div className="flex items-center gap-1 text-sm font-qs-bold text-gray-900 group-hover:text-link transition-colors">
              {/* 🚀 替换图标为字符 Ξ */}
              <span className="font-qs-regular leading-none">Ξ</span>
              <span>{displayNumber(data.listing.amount)}</span>
            </div>
          ) : null}

          {/* B. Offer Price */}
          {data.offer && (
            <div className="text-xs font-qs-medium text-gray-400 group-hover:text-link/80 transition-colors flex items-center">
              <span className="opacity-70 mr-1">{t("market.bid")}</span>
              {displayNumber(data.offer.amount)} {data.offer.currency}
            </div>
          )}
        </a>
      </Tooltip>
    </div>
  );
};
