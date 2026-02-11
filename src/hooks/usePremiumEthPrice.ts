// src/hooks/usePremiumEthPrice.ts

import { useMemo } from "react";
// 引用您提供的 index.ts 中生成的 Hook
import { useReadEthPriceFeedLatestAnswer } from "../wagmi-generated/index";
import { fetchPremiumPrice, isPremium } from "../utils/ens";
import type { NameRecord } from "../types/ensNames";
import { displayNumber } from "../utils/format";

/**
 * Hook: 计算 Premium 状态域名的实时 ETH 价格
 */
export function usePremiumEthPrice(
  status: NameRecord["status"],
  releaseTime: number,
  now: number, // 接收父组件传入的统一时间戳 (秒)
) {
  // 1. 只有是 Premium 状态时才查询 Chainlink 预言机
  const shouldFetch = isPremium(status);

  // 2. 获取 ETH/USD 价格 (Chainlink Feed)
  const { data: latestAnswer } = useReadEthPriceFeedLatestAnswer({
    query: {
      enabled: shouldFetch,
      staleTime: 1000 * 60 * 5,
    },
  });

  // 3. 派生状态：在渲染期间计算
  const priceDisplay = useMemo(() => {
    // 显式引用 now，这一行有两个作用：
    // 1. 消除 ESLint "unnecessary dependency" 报错
    // 2. 告诉维护者：这个计算块必须随 now 变化而重新执行 (因为 fetchPremiumPrice 内部依赖时间)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    now;

    if (!shouldFetch || !latestAnswer || !releaseTime) return null;

    // A. 计算当前 USD 溢价
    // fetchPremiumPrice 内部会使用当前时间，所以上面的 `now` 触发重算很重要
    const usdPremiumString = fetchPremiumPrice(releaseTime, 20);
    const usdPremium = parseFloat(usdPremiumString);

    // B. 解析 Chainlink 价格 (int256, 8 decimals)
    const ethUsdRate = Number(latestAnswer) / 1e8;

    if (ethUsdRate <= 0) return null;

    // C. 换算为 ETH
    const ethPrice = usdPremium / ethUsdRate;

    return displayNumber(ethPrice);
  }, [shouldFetch, latestAnswer, releaseTime, now]);

  return priceDisplay;
}
