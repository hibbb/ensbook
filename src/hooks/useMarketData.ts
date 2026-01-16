// src/hooks/useMarketData.ts

import { useQuery } from "@tanstack/react-query";
import { fetchOpenSeaData } from "../services/market/opensea"; // 🚀 切换服务
import type { NameRecord } from "../types/ensNames";
import type { MarketDataMap } from "../types/marketData"; // 🚀 切换类型

export const useMarketData = (records: NameRecord[] | undefined) => {
  const queryKeyLabels = records
    ? records
        .map((r) => r.label)
        .sort()
        .join(",")
    : "";

  return useQuery({
    queryKey: ["market-data", queryKeyLabels],
    queryFn: async (): Promise<MarketDataMap> => {
      if (!records || records.length === 0) return {};
      return await fetchOpenSeaData(records);
    },
    enabled: !!records && records.length > 0,
    staleTime: 1000 * 60 * 2, // 2分钟缓存，保证近实时
    refetchOnWindowFocus: false,
    retry: false,
  });
};
