// src/hooks/useMarketData.ts

import { useQuery } from "@tanstack/react-query";
import { fetchSingleMarketData } from "../services/market/opensea";
import { isRegistrable } from "../utils/ens";
import type { NameRecord } from "../types/ensNames";

export const useMarketData = (record: NameRecord, isVisible: boolean) => {
  return useQuery({
    queryKey: ["market-data", record.label],
    queryFn: () => fetchSingleMarketData(record),
    // 只有当行可见，且域名不可注册（已注册状态）时，才发起请求
    enabled: isVisible && !isRegistrable(record.status),
    staleTime: 1000 * 60 * 5, // 5分钟缓存
    refetchOnWindowFocus: false,
    retry: false,
  });
};
