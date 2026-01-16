// src/types/marketData.ts

export type CurrencyType = "ETH" | "WETH" | "USDC" | "USD";

export type MarketplaceId =
  | "opensea"
  | "ensvision"
  | "looksrare"
  | "x2y2"
  | "blur"
  | "magiceden"
  | "unknown";

/**
 * 基础价格单元
 */
export interface MarketPrice {
  amount: number; // 显示数值 (如 0.05)
  currency: CurrencyType;
  rawAmount?: string; // 链上原始数值 (wei)
  usdValue?: number; // 换算后的美元价值
}

/**
 * 市场单据详情 (挂单 Listing 或 报价 Offer)
 */
export interface MarketOrder {
  price: MarketPrice;
  marketplace: MarketplaceId; // 来源市场
  link: string; // 跳转链接
  startTime: number; // 挂单时间
  endTime?: number; // 过期时间
  sourceDomain?: string; // 来源域名 (如 opensea.io)
}

/**
 * 上次成交详情
 */
export interface LastSale {
  price: MarketPrice;
  marketplace: MarketplaceId;
  timestamp: number;
  txHash?: string;
}

/**
 * 核心：单个域名的市场数据聚合对象
 */
export interface EnsItemMarketData {
  label: string; // 关联键 (方便 UI 映射)

  // 挂单 (Ask / Listing) - 卖方心理价
  bestListing?: MarketOrder;

  // 报价 (Bid / Offer) - 买方心理价
  bestOffer?: MarketOrder;

  // 上次成交 - 参考价
  lastSale?: LastSale;

  // 数据获取时间
  lastUpdated: number;
}

/**
 * 集合维度的市场数据 (Collection Stats)
 * 暂用于 Collection 页面头部
 */
export interface EnsCollectionMetrics {
  floorPrice: {
    amount: number;
    currency: CurrencyType;
  };
  volume24h: number; // 24小时成交额 (ETH)
  totalListed: number; // 当前挂单总数
  totalOwners: number; // 持有者总数
}
