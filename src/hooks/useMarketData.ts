// src/hooks/useMarketData.ts

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchOpenSeaData } from "../services/market/opensea";
import type { NameRecord } from "../types/ensNames";
import type { MarketDataMap } from "../types/marketData";

export const useMarketData = (records: NameRecord[] | undefined) => {
  // 🚀 优化 1: 使用 useMemo 缓存 Key 的计算
  // 只有当 records 的长度或内容真正变化时才重新计算字符串
  // 解决了输入框打字卡顿的问题
  const queryKeyLabels = useMemo(() => {
    if (!records || records.length === 0) return "";
    // 只取 label 组成 key，足以标识这批数据
    return records
      .map((r) => r.label)
      .sort()
      .join(",");
  }, [records]);

  return useQuery({
    queryKey: ["market-data", queryKeyLabels],
    queryFn: async (): Promise<MarketDataMap> => {
      if (!records || records.length === 0) return {};
      return await fetchOpenSeaData(records);
    },
    enabled: !!records && records.length > 0,
    staleTime: 1000 * 60 * 2, // 2分钟缓存
    refetchOnWindowFocus: false,
    retry: false,

    // 🚀 优化 2: 使用 keepPreviousData
    // 当 queryKey 变化（例如添加了一个新域名）时，
    // React Query 会保留上一份数据展示在 UI 上，直到新数据请求回来。
    // 这样用户就不会看到整列变成骨架屏，而是看到旧数据 -> 新数据的平滑切换。
    placeholderData: keepPreviousData,
  });
};
