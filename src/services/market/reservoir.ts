// src/services/market/reservoir.ts

import { MAINNET_CONTRACTS } from "../../config/contracts";
import type { NameRecord } from "../../types/ensNames";
import type {
  EnsItemMarketData,
  MarketOrder,
  MarketplaceId,
  LastSale,
} from "../../types/marketData";

const RESERVOIR_API_BASE = "https://api.reservoir.tools";
// 如果将来有 API Key，可以从环境变量读取
const API_KEY = import.meta.env.VITE_RESERVOIR_API_KEY;

// 辅助：获取 Token ID (十进制字符串)
const getTokenId = (record: NameRecord): string => {
  // Wrapped: 使用 Namehash
  if (record.wrapped) {
    return BigInt(record.namehash).toString();
  }
  // Unwrapped: 使用 Labelhash
  return BigInt(record.labelhash).toString();
};

// 辅助：获取合约地址
const getContractAddress = (record: NameRecord): string => {
  if (record.wrapped) {
    return MAINNET_CONTRACTS.ENS_NAME_WRAPPER.toLowerCase();
  }
  return MAINNET_CONTRACTS.ETH_REGISTRAR.toLowerCase();
};

// 辅助：解析市场来源 ID
const parseSource = (source: string | undefined): MarketplaceId => {
  if (!source) return "unknown";
  const s = source.toLowerCase();
  if (s.includes("opensea")) return "opensea";
  if (s.includes("blur")) return "blur";
  if (s.includes("ens.vision") || s.includes("ensvision")) return "ensvision";
  if (s.includes("looksrare")) return "looksrare";
  if (s.includes("x2y2")) return "x2y2";
  if (s.includes("magiceden")) return "magiceden";
  return "unknown";
};

// 核心：批量获取市场数据
export async function fetchMarketDataBatch(
  records: NameRecord[],
): Promise<Record<string, EnsItemMarketData>> {
  if (records.length === 0) return {};

  // 1. 构建查询参数
  // Reservoir 支持 tokens 参数：contract:tokenId
  const queryParams = new URLSearchParams();

  // 用于将 "contract:tokenId" 映射回 label，方便后续组装数据
  const idToLabelMap = new Map<string, string>();

  records.forEach((r) => {
    const contract = getContractAddress(r);
    const tokenId = getTokenId(r);
    const key = `${contract}:${tokenId}`;

    idToLabelMap.set(key, r.label);
    queryParams.append("tokens", key);
  });

  // 添加其他必要字段
  queryParams.append("includeTopBid", "true"); // 获取最佳 Offer
  queryParams.append("includeLastSale", "true"); // 获取上次成交
  queryParams.append("limit", "50"); // 限制单次最大条数，配合我们 UI 的分页

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (API_KEY) {
      headers["x-api-key"] = API_KEY;
    }

    const response = await fetch(
      `${RESERVOIR_API_BASE}/tokens/v6?${queryParams.toString()}`,
      { headers },
    );

    if (!response.ok) {
      console.warn(`Reservoir API Error: ${response.status}`);
      return {};
    }

    const json = await response.json();
    const tokens = json.tokens || [];
    const resultMap: Record<string, EnsItemMarketData> = {};

    // 2. 解析响应数据
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tokens.forEach((item: any) => {
      const token = item.token;
      const market = item.market;

      const key = `${token.contract}:${token.tokenId}`.toLowerCase();
      // 注意：API 返回的 contract 可能是小写，我们需要确保 key 匹配
      // 这里做一个查找：
      const matchedLabel = Array.from(idToLabelMap.entries()).find(
        ([k]) => k.toLowerCase() === key,
      )?.[1];

      if (!matchedLabel) return;

      const data: EnsItemMarketData = {
        label: matchedLabel,
        lastUpdated: Date.now(),
      };

      // 解析 Listing (Floor Ask)
      if (market.floorAsk && market.floorAsk.price) {
        data.bestListing = {
          price: {
            amount: market.floorAsk.price.amount.native,
            currency: "ETH", // Reservoir native 通常是 ETH
            usdValue: market.floorAsk.price.amount.usd,
          },
          marketplace: parseSource(market.floorAsk.source?.domain),
          link:
            market.floorAsk.source?.url ||
            `https://opensea.io/assets/ethereum/${token.contract}/${token.tokenId}`,
          startTime: new Date(market.floorAsk.validFrom).getTime(),
          sourceDomain: market.floorAsk.source?.domain,
        } as MarketOrder;
      }

      // 解析 Offer (Top Bid)
      if (market.topBid && market.topBid.price) {
        data.bestOffer = {
          price: {
            amount: market.topBid.price.amount.native,
            currency: "WETH", // Bid 通常是 WETH
            usdValue: market.topBid.price.amount.usd,
          },
          marketplace: parseSource(market.topBid.source?.domain),
          link: market.topBid.source?.url || "", // Offer 链接可能不直接
          startTime: new Date(market.topBid.validFrom).getTime(),
          sourceDomain: market.topBid.source?.domain,
        } as MarketOrder;
      }

      // 解析 Last Sale
      if (token.lastSale && token.lastSale.price) {
        data.lastSale = {
          price: {
            amount: token.lastSale.price.amount.native,
            currency: "ETH",
            usdValue: token.lastSale.price.amount.usd,
          },
          timestamp: token.lastSale.timestamp,
          marketplace: parseSource(token.lastSale.marketplace),
          txHash: token.lastSale.txHash,
        } as LastSale;
      }

      resultMap[matchedLabel] = data;
    });

    return resultMap;
  } catch (error) {
    console.error("Fetch Market Data Failed:", error);
    return {};
  }
}
