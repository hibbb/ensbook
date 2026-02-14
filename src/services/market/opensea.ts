// src/services/market/opensea.ts

import { formatUnits } from "viem";
import { MAINNET_CONTRACTS } from "../../config/contracts";
import {
  OPENSEA_API_BASE_URL,
  OPENSEA_API_KEY,
  OPENSEA_WEB_BASE_URL,
} from "../../config/env";
import { BATCH_CONFIG } from "../../config/constants";
import { isRegistrable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";
import type { MarketDataMap } from "../../types/marketData";

const CHUNK_SIZE = BATCH_CONFIG.OPENSEA_CHUNK_SIZE;

// 允许的币种白名单
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
  if (OPENSEA_API_KEY) {
    headers["X-API-KEY"] = OPENSEA_API_KEY;
  }
  return headers;
};

async function fetchBatchOrders(
  records: NameRecord[],
  side: "listings" | "offers",
  resultMap: MarketDataMap,
) {
  // 如果没有记录，直接返回（防御性编程）
  if (records.length === 0) return;

  const groups: Record<string, NameRecord[]> = {};
  const idToLabel: Record<string, string> = {};

  for (const r of records) {
    const contract = getContract(r);
    const tokenId = getTokenId(r);
    if (!groups[contract]) groups[contract] = [];
    groups[contract].push(r);

    // 这里的 key 构造必须与下面 loop 中的一致
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

          const url = `${OPENSEA_API_BASE_URL}/orders/ethereum/seaport/${side}?${params.toString()}`;

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

            // 如果找不到 label，说明这个订单不属于我们查询的范围（或者被过滤了）
            if (!label) continue;

            const paymentToken = order.payment_token_contract;
            const decimals = paymentToken?.decimals ?? 18;
            const symbol =
              paymentToken?.symbol ?? (side === "listings" ? "ETH" : "WETH");

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
              url: `${OPENSEA_WEB_BASE_URL}/assets/ethereum/${contract}/${tokenId}`,
            };

            if (side === "listings") {
              const current = resultMap[label].listing;
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
  if (!OPENSEA_API_KEY || records.length === 0) return {};

  // 🚀 核心修复：在发起请求前，直接过滤掉“可注册”状态的域名
  // 只有 Active 和 Grace 状态的域名才需要查询市场数据
  // Available, Released, Premium 状态的域名，其 OpenSea 挂单是无效的
  const validRecords = records.filter((r) => !isRegistrable(r.status));

  if (validRecords.length === 0) return {};

  const resultMap: MarketDataMap = {};

  await Promise.allSettled([
    fetchBatchOrders(validRecords, "listings", resultMap),
    fetchBatchOrders(validRecords, "offers", resultMap),
  ]);

  return resultMap;
}
