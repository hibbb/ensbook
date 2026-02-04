// src/services/market/opensea.ts

import { formatUnits } from "viem";
import { MAINNET_CONTRACTS } from "../../config/contracts";
import type { NameRecord } from "../../types/ensNames";
import type { MarketDataMap } from "../../types/marketData";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";
const API_KEY = import.meta.env.VITE_OPENSEA_API_KEY;

const CHUNK_SIZE = 30;

// 🚀 1. 定义允许的币种白名单
const ALLOWED_CURRENCIES = ["ETH", "WETH", "USDC", "USDT", "DAI"];

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

            // 获取币种信息
            const paymentToken = order.payment_token_contract;
            const decimals = paymentToken?.decimals ?? 18;
            const symbol =
              paymentToken?.symbol ?? (side === "listings" ? "ETH" : "WETH");

            // 🚀 2. 核心过滤：如果不是白名单币种，直接跳过
            if (!ALLOWED_CURRENCIES.includes(symbol.toUpperCase())) {
              continue;
            }

            if (!resultMap[label]) resultMap[label] = {};

            const priceVal = parseFloat(
              formatUnits(BigInt(order.current_price), decimals),
            );

            const priceData = {
              amount: priceVal,
              currency: symbol,
              url: `https://opensea.io/assets/ethereum/${contract}/${tokenId}`,
            };

            if (side === "listings") {
              const current = resultMap[label].listing;
              // 简单数值比较 (假设主流币种价值差异在可接受范围内，或者只展示同币种最低)
              if (!current || priceVal < current.amount) {
                resultMap[label].listing = priceData;
              }
            } else {
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

  await Promise.allSettled([
    fetchBatchOrders(records, "listings", resultMap),
    fetchBatchOrders(records, "offers", resultMap),
  ]);

  return resultMap;
}
