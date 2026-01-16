// src/services/market/opensea.ts

import { formatEther } from "viem";
import { MAINNET_CONTRACTS } from "../../config/contracts";
import type { NameRecord } from "../../types/ensNames";
import type { MarketDataMap } from "../../types/marketData";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";
const API_KEY = import.meta.env.VITE_OPENSEA_API_KEY;

// ⚡️ 策略调整：
// 1. 切片设为 5：为了配合 limit=50。
// 2. 50/5 = 10。平均每个 Token 能获取 10 个订单。
// 3. 由于不能服务端按价格排序，我们需要获取足够多的订单在前端找最低价。
const LISTING_CHUNK_SIZE = 5;

// Bids 并发请求数量限制
const BID_CONCURRENCY_LIMIT = 4;

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
 * 🔹 1. 获取最低挂单 (Best Ask)
 */
async function fetchBestAsks(records: NameRecord[], resultMap: MarketDataMap) {
  const groups: Record<string, NameRecord[]> = {};
  const idToLabel: Record<string, string> = {};

  for (const r of records) {
    const contract = getContract(r);
    const tokenId = getTokenId(r);
    if (!groups[contract]) groups[contract] = [];
    groups[contract].push(r);
    idToLabel[`${contract}:${tokenId}`] = r.label;
  }

  for (const [contract, groupRecords] of Object.entries(groups)) {
    const chunks = chunkArray(groupRecords, LISTING_CHUNK_SIZE);

    // 串行处理切片，防止 429
    for (const chunk of chunks) {
      try {
        const tokenIds = chunk.map((r) => getTokenId(r));
        const params = new URLSearchParams();
        params.append("asset_contract_address", contract);
        tokenIds.forEach((id) => params.append("token_ids", id));

        params.append("limit", "50");
        // 🚀 核心修复：移除 order_by 和 order_direction
        // OpenSea 不支持在批量查询时按价格排序
        // params.append("order_by", "eth_price");
        // params.append("order_direction", "asc");

        const url = `${OPENSEA_API_BASE}/orders/ethereum/seaport/listings?${params.toString()}`;

        const res = await fetch(url, { headers });
        if (!res.ok) {
          // 仅在非 400/404 时警告，避免干扰
          if (res.status !== 404) {
            console.warn(`OpenSea listings error: ${res.status}`);
          }
          continue;
        }

        const json = await res.json();
        const orders = json.orders || [];

        for (const order of orders) {
          if (order.cancelled || order.finalized || order.is_expired) continue;

          const item = order.maker_asset_bundle?.assets?.[0];
          if (!item) continue;

          const tokenId = item.token_id;
          const key = `${contract}:${tokenId}`;
          const label = idToLabel[key];

          if (!label) continue;

          if (!resultMap[label]) resultMap[label] = {};

          const priceVal = parseFloat(formatEther(BigInt(order.current_price)));

          // 前端比价逻辑：保留最低价
          const current = resultMap[label].listing;
          if (!current || priceVal < current.amount) {
            resultMap[label].listing = {
              amount: priceVal,
              currency: "ETH",
              url: `https://opensea.io/assets/ethereum/${contract}/${tokenId}`,
            };
          }
        }
      } catch (e) {
        console.warn("OpenSea listings chunk failed", e);
      }
    }
  }
}

/**
 * 🔹 2. 获取最高出价 (Best Bid)
 */
async function fetchBestBids(records: NameRecord[], resultMap: MarketDataMap) {
  const chunks = chunkArray(records, BID_CONCURRENCY_LIMIT);

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (record) => {
        try {
          const contract = getContract(record);
          const tokenId = getTokenId(record);
          const url = `${OPENSEA_API_BASE}/chain/ethereum/contract/${contract}/nfts/${tokenId}`;

          const res = await fetch(url, { headers });
          if (!res.ok) {
            // 🟡 Debug: 请求失败
            console.warn(`[Bid Fail] ${record.label}: ${res.status}`);
            return;
          }

          const json = await res.json();
          const bestOffer = json.nft?.best_offer;

          // 🟡 Debug: 查看是否有 Offer
          console.log(
            `[Bid Check] ${record.label}:`,
            bestOffer ? "有出价" : "无出价",
          );

          if (!bestOffer) return;

          if (!resultMap[record.label]) resultMap[record.label] = {};

          const priceVal = parseFloat(
            formatEther(BigInt(bestOffer.price?.value || "0")),
          );

          if (priceVal > 0) {
            resultMap[record.label].offer = {
              amount: priceVal,
              currency: bestOffer.price?.currency || "WETH",
              url: `https://opensea.io/assets/ethereum/${contract}/${tokenId}`,
            };
          }
        } catch (e) {
          console.log(e);
        }
      }),
    );
  }
}

/**
 * 🔹 对外主入口
 */
export async function fetchOpenSeaData(
  records: NameRecord[],
): Promise<MarketDataMap> {
  if (!API_KEY || records.length === 0) return {};

  const resultMap: MarketDataMap = {};

  await Promise.allSettled([
    fetchBestAsks(records, resultMap),
    fetchBestBids(records, resultMap),
  ]);

  return resultMap;
}
