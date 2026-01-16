// src/services/market/opensea.ts

import { formatEther } from "viem";
import { MAINNET_CONTRACTS } from "../../config/contracts";
import type { NameRecord } from "../../types/ensNames";
import type { SimpleMarketData, MarketDataMap } from "../../types/marketData";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";
const API_KEY = import.meta.env.VITE_OPENSEA_API_KEY;

// 辅助：获取 Token ID
const getTokenId = (record: NameRecord): string => {
  return record.wrapped
    ? BigInt(record.namehash).toString()
    : BigInt(record.labelhash).toString();
};

// 辅助：获取合约地址
const getContract = (record: NameRecord): string => {
  return record.wrapped
    ? MAINNET_CONTRACTS.ENS_NAME_WRAPPER.toLowerCase()
    : MAINNET_CONTRACTS.ETH_REGISTRAR.toLowerCase();
};

/**
 * 从 OpenSea 获取一批 Token 的最佳挂单和报价
 */
export async function fetchOpenSeaData(
  records: NameRecord[],
): Promise<MarketDataMap> {
  if (records.length === 0 || !API_KEY) return {};

  // 🚀 显式使用 SimpleMarketData 类型，消除 ESLint 警告
  const resultMap: Record<string, SimpleMarketData> = {};

  // 1. 分组与映射
  const groups: Record<string, string[]> = {};
  // 映射：Contract:TokenId -> Label (用于回填数据)
  const idToLabel: Record<string, string> = {};

  records.forEach((r) => {
    const contract = getContract(r);
    const tokenId = getTokenId(r);
    const key = `${contract}:${tokenId}`;

    if (!groups[contract]) groups[contract] = [];
    groups[contract].push(tokenId);

    idToLabel[key] = r.label;
  });

  // 2. 构建请求任务
  const tasks: Promise<void>[] = [];

  Object.entries(groups).forEach(([contract, tokenIds]) => {
    // OpenSea URL 长度有限制，如果 tokenIds 太多建议切片，这里假设每页 50 个还能接受
    // A. 获取 Listings (挂单)
    tasks.push(
      fetchOrders(contract, tokenIds, "listings", resultMap, idToLabel),
    );
    // B. 获取 Offers (报价)
    tasks.push(fetchOrders(contract, tokenIds, "offers", resultMap, idToLabel));
  });

  await Promise.allSettled(tasks);
  return resultMap;
}

async function fetchOrders(
  contract: string,
  tokenIds: string[],
  side: "listings" | "offers",
  resultMap: Record<string, SimpleMarketData>,
  idToLabel: Record<string, string>,
) {
  try {
    const params = new URLSearchParams();
    params.append("asset_contract_address", contract);
    tokenIds.forEach((id) => params.append("token_ids", id));
    params.append("limit", "50");
    params.append("order_by", side === "listings" ? "eth_price" : "price");
    params.append("order_direction", side === "listings" ? "asc" : "desc");

    const url = `${OPENSEA_API_BASE}/orders/ethereum/seaport/${side}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "X-API-KEY": API_KEY,
        accept: "application/json",
      },
    });

    if (!response.ok) return;

    const json = await response.json();
    const orders = json.orders || [];

    for (const order of orders) {
      if (order.cancelled || order.finalized || order.is_expired) continue;

      const item = order.maker_asset_bundle?.assets?.[0];
      if (!item) continue;

      const tokenId = item.token_id;
      const key = `${contract}:${tokenId}`;
      const label = idToLabel[key];

      // 如果找不到对应的 label，说明不是我们请求的数据，跳过
      if (!label) continue;

      // 初始化对象
      if (!resultMap[label]) {
        resultMap[label] = {};
      }

      // 🚀 使用 viem 的 formatEther 处理精度，更安全
      const priceVal = parseFloat(formatEther(BigInt(order.current_price)));

      const priceData = {
        amount: priceVal,
        currency: "ETH", // Seaport 主要是 ETH/WETH
        url: `https://opensea.io/assets/ethereum/${contract}/${tokenId}`,
      };

      if (side === "listings") {
        // 逻辑：取最低价
        const currentListing = resultMap[label].listing;
        if (!currentListing || priceVal < currentListing.amount) {
          resultMap[label].listing = priceData;
        }
      } else {
        // 逻辑：取最高价
        const currentOffer = resultMap[label].offer;
        if (!currentOffer || priceVal > currentOffer.amount) {
          priceData.currency = "WETH"; // Offer 通常是 WETH
          resultMap[label].offer = priceData;
        }
      }
    }
  } catch (e) {
    console.warn(`Fetch OpenSea ${side} failed:`, e);
  }
}
