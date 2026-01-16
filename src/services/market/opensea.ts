// src/services/market/opensea.ts

import { formatEther } from "viem";
import { MAINNET_CONTRACTS } from "../../config/contracts";
import type { NameRecord } from "../../types/ensNames";
import type { MarketDataMap } from "../../types/marketData";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";
const API_KEY = import.meta.env.VITE_OPENSEA_API_KEY;

// ⚡️ 性能优化：
// 既然去掉了 order_by，我们可以安全地增加切片大小。
// 30 个 ID 的 URL 长度约为 2500 字符，通常是安全的。
// 这样 50 个数据只需要 2 次请求。
const CHUNK_SIZE = 30;

const getTokenId = (record: NameRecord): string => {
  return record.wrapped
    ? BigInt(record.namehash).toString()
    : BigInt(record.labelhash).toString();
};

const getContract = (record: NameRecord): string => {
  return record.wrapped
    ? MAINNET_CONTRACTS.ENS_NAME_WRAPPER.toLowerCase()
    : MAINNET_CONTRACTS.ETH_REGISTRAR.toLowerCase();
};

function chunkArray<T>(array: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    res.push(array.slice(i, i + size));
  }
  return res;
}

const headers = {
  accept: "application/json",
  "x-api-key": API_KEY,
};

/**
 * 通用批量获取函数 (Listings 和 Offers)
 */
async function fetchBatchOrders(
  records: NameRecord[],
  side: "listings" | "offers",
  resultMap: MarketDataMap,
) {
  const groups: Record<string, NameRecord[]> = {};
  const idToLabel: Record<string, string> = {};

  for (const r of records) {
    const contract = getContract(r);
    const tokenId = getTokenId(r);
    if (!groups[contract]) groups[contract] = [];
    groups[contract].push(r);
    idToLabel[`${contract}:${tokenId}`] = r.label;
  }

  // 并行处理所有合约组
  const promises = Object.entries(groups).flatMap(
    ([contract, groupRecords]) => {
      const chunks = chunkArray(groupRecords, CHUNK_SIZE);

      return chunks.map(async (chunk) => {
        try {
          const tokenIds = chunk.map((r) => getTokenId(r));
          const params = new URLSearchParams();

          params.append("asset_contract_address", contract);
          tokenIds.forEach((id) => params.append("token_ids", id));
          params.append("limit", "50"); // 获取尽可能多的订单

          // ❌ 移除 order_by，防止 400 错误
          // params.append("order_by", "eth_price");

          const url = `${OPENSEA_API_BASE}/orders/ethereum/seaport/${side}?${params.toString()}`;

          const res = await fetch(url, { headers });
          if (!res.ok) return;

          const json = await res.json();
          const orders = json.orders || [];

          for (const order of orders) {
            if (order.cancelled || order.finalized || order.is_expired)
              continue;

            const item = order.maker_asset_bundle?.assets?.[0];
            if (!item) continue;

            const tokenId = item.token_id;
            const key = `${contract}:${tokenId}`;
            const label = idToLabel[key];

            if (!label) continue;

            if (!resultMap[label]) resultMap[label] = {};

            const priceVal = parseFloat(
              formatEther(BigInt(order.current_price)),
            );

            const priceData = {
              amount: priceVal,
              currency: side === "listings" ? "ETH" : "WETH",
              url: `https://opensea.io/assets/ethereum/${contract}/${tokenId}`,
            };

            if (side === "listings") {
              // 客户端比价：取最低
              const current = resultMap[label].listing;
              if (!current || priceVal < current.amount) {
                resultMap[label].listing = priceData;
              }
            } else {
              // 客户端比价：取最高
              const current = resultMap[label].offer;
              if (!current || priceVal > current.amount) {
                resultMap[label].offer = priceData;
              }
            }
          }
        } catch (e) {
          console.warn(`OpenSea ${side} chunk failed:`, e);
        }
      });
    },
  );

  await Promise.all(promises);
}

export async function fetchOpenSeaData(
  records: NameRecord[],
): Promise<MarketDataMap> {
  if (!API_KEY || records.length === 0) return {};

  const resultMap: MarketDataMap = {};

  // 并行获取 Listings 和 Offers
  // 现在两者都使用批量接口，速度会非常快
  await Promise.allSettled([
    fetchBatchOrders(records, "listings", resultMap),
    fetchBatchOrders(records, "offers", resultMap),
  ]);

  return resultMap;
}
