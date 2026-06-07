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

// 核心修改：兼容 Listing 和 Offer 不同的 JSON 结构
async function fetchBestPrice(
  record: NameRecord,
  side: "listings" | "offers",
  resultMap: MarketDataMap,
) {
  const tokenId = getTokenId(record);
  const contract = getContract(record);
  // ENS 在 OpenSea 上的 collection slug 统一为 'ens'
  const url = `${OPENSEA_API_BASE_URL}/${side}/collection/ens/nfts/${tokenId}/best`;

  try {
    const res = await fetch(url, { headers: getHeaders() });

    if (!res.ok) {
      // 静默处理 404(无挂单/出价) 和 429(限流)，保持浏览器控制台干净
      if (res.status !== 404 && res.status !== 429) {
        console.warn(`OpenSea ${side} error: ${res.status}`);
      }
      return;
    }

    const data = await res.json();

    // 🚀 核心修复：动态提取 price 对象
    // Listing 在 data.price.current，Offer 在 data.price
    const priceObj = data?.price?.current || data?.price;

    if (!priceObj || !priceObj.value) return;

    const currency =
      priceObj.currency || (side === "listings" ? "ETH" : "WETH");

    if (!ALLOWED_CURRENCIES.includes(currency.toUpperCase())) {
      return;
    }

    const decimals = priceObj.decimals ?? 18;
    const value = priceObj.value;
    const amount = parseFloat(formatUnits(BigInt(value), decimals));

    const priceData = {
      amount,
      currency: currency.toUpperCase(),
      url: `${OPENSEA_WEB_BASE_URL}/assets/ethereum/${contract}/${tokenId}`,
    };

    if (!resultMap[record.label]) resultMap[record.label] = {};

    if (side === "listings") {
      resultMap[record.label].listing = priceData;
    } else {
      resultMap[record.label].offer = priceData;
    }
  } catch (e) {
    // 忽略网络错误
    console.log(e);
  }
}

async function fetchBatchOrders(
  records: NameRecord[],
  side: "listings" | "offers",
  resultMap: MarketDataMap,
) {
  if (records.length === 0) return;

  const chunks = chunkArray(records, CHUNK_SIZE);

  // 按批次并发请求，追求极致加载速度
  for (const chunk of chunks) {
    const promises = chunk.map((record) =>
      fetchBestPrice(record, side, resultMap),
    );
    await Promise.all(promises);
  }
}

export async function fetchOpenSeaData(
  records: NameRecord[],
): Promise<MarketDataMap> {
  if (!OPENSEA_API_KEY || records.length === 0) return {};

  // 过滤掉可注册的域名，只查询已注册的
  const validRecords = records.filter((r) => !isRegistrable(r.status));

  if (validRecords.length === 0) return {};

  const resultMap: MarketDataMap = {};

  // 同时并发查询挂单和出价
  await Promise.allSettled([
    fetchBatchOrders(validRecords, "listings", resultMap),
    fetchBatchOrders(validRecords, "offers", resultMap),
  ]);

  return resultMap;
}
