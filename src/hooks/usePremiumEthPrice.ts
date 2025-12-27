// src/hooks/usePremiumEthPrice.ts

import { useState, useEffect, useMemo } from "react";
// 引用您提供的 index.ts 中生成的 Hook
import { useReadEthPriceFeedLatestAnswer } from "../wagmi-generated/index";
import { fetchPremiumPrice, isPremium } from "../utils/ens";
import type { NameRecord } from "../types/ensNames";

const displayNumber = (n: number) => {
  // 1. 处理极小数值的特殊情况 (0.9995 以下保留3位)
  if (n < 0.9995) {
    return parseFloat(n.toFixed(3)).toString();
  }

  // 2. 确定单位和缩放比例
  // 阈值说明：999.5 进位为 1K，999500 进位为 1M
  const i = n < 999.5 ? 0 : n < 999500 ? 1 : 2;
  const suffix = ["", "K", "M"][i];
  const scaled = n / [1, 1000, 1000000][i];

  // 3. 根据缩放后的数值确定精度
  // < 9.995 保留2位，< 99.95 保留1位，否则保留0位
  const precision = scaled < 9.995 ? 2 : scaled < 99.95 ? 1 : 0;

  // 4. 格式化并确保返回 string
  let result;
  if (precision > 0) {
    // parseFloat 会去掉 toFixed 产生的多余 0 (如 "1.10" -> "1.1")
    result = parseFloat(scaled.toFixed(precision)).toString();
  } else {
    result = scaled.toFixed(0);
  }

  return suffix ? `${result}${suffix}` : result;
};

/**
 * Hook: 计算 Premium 状态域名的实时 ETH 价格
 */
export function usePremiumEthPrice(
  status: NameRecord["status"],
  releaseTime: number,
) {
  // 1. 只有是 Premium 状态时才查询 Chainlink 预言机
  const shouldFetch = isPremium(status);

  // 2. 获取 ETH/USD 价格 (Chainlink Feed)
  const { data: latestAnswer } = useReadEthPriceFeedLatestAnswer({
    query: {
      enabled: shouldFetch,
      staleTime: 1000 * 60 * 5, // 价格 5 分钟内不过期
    },
  });

  // 3. 计时器状态：用于每秒强制重渲染以更新衰减价格
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!shouldFetch) return;

    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldFetch]);

  // 4. 派生状态：在渲染期间计算
  const priceDisplay = useMemo(() => {
    // 🚀 修复 ESLint 警告：在逻辑中显式引用 tick
    // 这告诉 React 这个 memo 块确实依赖于 tick 的变化
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    tick;

    if (!shouldFetch || !latestAnswer || !releaseTime) return null;

    // A. 计算当前 USD 溢价
    const usdPremiumString = fetchPremiumPrice(releaseTime, 20);
    const usdPremium = parseFloat(usdPremiumString);

    // B. 解析 Chainlink 价格 (int256, 8 decimals)
    const ethUsdRate = Number(latestAnswer) / 1e8;

    if (ethUsdRate <= 0) return null;

    // C. 换算为 ETH
    const ethPrice = usdPremium / ethUsdRate;

    return displayNumber(ethPrice);
  }, [shouldFetch, latestAnswer, releaseTime, tick]);

  return priceDisplay;
}
