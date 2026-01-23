// src/services/market/opensea.ts

import { formatEther } from "viem";
import { MAINNET_CONTRACTS } from "../../config/contracts";
import type { NameRecord } from "../../types/ensNames";
import type { MarketDataMap } from "../../types/marketData";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";
const API_KEY = import.meta.env.VITE_OPENSEA_API_KEY;

// 30 个 ID 的 URL 长度约为 2500 字符，通常是安全的。
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

const getHeaders = () => {
  const headers: HeadersInit = {
    accept: "application/json",
  };
  if (API_KEY) {
    headers["X-API-KEY"] = API_KEY;
  }
  return headers;
};

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

  const promises = Object.entries(groups).flatMap(
    ([contract, groupRecords]) => {
      const chunks = chunkArray(groupRecords, CHUNK_SIZE);

      return chunks.map(async (chunk) => {
        try {
          const tokenIds = chunk.map((r) => getTokenId(r));
          const params = new URLSearchParams();

          params.append("asset_contract_address", contract);
          tokenIds.forEach((id) => params.append("token_ids", id));
          params.append("limit", "50");

          const url = `${OPENSEA_API_BASE}/orders/ethereum/seaport/${side}?${params.toString()}`;

          const res = await fetch(url, { headers: getHeaders() });

          if (!res.ok) {
            // 仅在非 404 时警告 (404 可能意味着没有订单，不一定是错误)
            if (res.status !== 404) {
              console.warn(`OpenSea ${side} error: ${res.status}`);
            }
            return;
          }

          const json = await res.json();
          const orders = json.orders || [];

          for (const order of orders) {
            if (order.cancelled || order.finalized || order.is_expired)
              continue;

            // 根据 side 决定去哪里找 Token ID
            let item;
            if (side === "listings") {
              item = order.maker_asset_bundle?.assets?.[0];
            } else {
              item = order.taker_asset_bundle?.assets?.[0];
            }

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
              const current = resultMap[label].listing;
              // 取最低价
              if (!current || priceVal < current.amount) {
                resultMap[label].listing = priceData;
              }
            } else {
              const current = resultMap[label].offer;
              // 取最高价
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

  await Promise.allSettled([
    fetchBatchOrders(records, "listings", resultMap),
    fetchBatchOrders(records, "offers", resultMap),
  ]);

  return resultMap;
}
