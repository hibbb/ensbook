// src/types/marketData.ts

/**
 * 极简市场数据结构
 * 只关心：最低挂单价、最高出价
 */
export interface SimpleMarketData {
  // 最低挂单 (Best Listing)
  listing?: {
    amount: number; // 例如 0.05
    currency: string; // 例如 "ETH"
    url: string; // 跳转链接
  };

  // 最高出价 (Best Offer)
  offer?: {
    amount: number; // 例如 0.45
    currency: string; // 例如 "WETH"
    url: string; // 跳转链接
  };
}

// 这是一个映射表：Label -> MarketData
export type MarketDataMap = Record<string, SimpleMarketData>;
