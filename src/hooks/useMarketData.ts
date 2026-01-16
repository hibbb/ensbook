// src/hooks/useMarketData.ts

import { useQuery } from "@tanstack/react-query";
import { fetchMarketDataBatch } from "../services/market/reservoir";
import type { NameRecord } from "../types/ensNames";
import type { EnsItemMarketData } from "../types/marketData";

export const useMarketData = (records: NameRecord[] | undefined) => {
  // 生成一个稳定的 Key：基于当前页面所有 Label 的组合
  // 这样当翻页时，Key 会变，自动触发请求
  const queryKeyLabels = records
    ? records
        .map((r) => r.label)
        .sort()
        .join(",")
    : "";

  return useQuery({
    queryKey: ["market-data", queryKeyLabels],
    queryFn: async (): Promise<Record<string, EnsItemMarketData>> => {
      if (!records || records.length === 0) return {};
      return await fetchMarketDataBatch(records);
    },
    // 只有当有记录时才请求
    enabled: !!records && records.length > 0,
    // 缓存 5 分钟，市场数据不需要太频繁更新
    staleTime: 1000 * 60 * 5,
    // 窗口重新聚焦时不强制刷新，减少 API 调用
    refetchOnWindowFocus: false,
    // 如果出错了，不重试，直接显示空状态即可，不影响主流程
    retry: false,
  });
};
