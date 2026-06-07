// src/services/market/opensea.ts

import { formatUnits } from "viem";
import { MAINNET_CONTRACTS } from "../../config/contracts";
import {
  OPENSEA_API_BASE_URL,
  OPENSEA_API_KEY,
  OPENSEA_WEB_BASE_URL,
} from "../../config/env";
import { isRegistrable } from "../../utils/ens";
import type { NameRecord } from "../../types/ensNames";
import type { SimpleMarketData } from "../../types/marketData";

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

const getHeaders = () => {
  const headers: HeadersInit = {
    accept: "application/json",
  };
  if (OPENSEA_API_KEY) {
    headers["X-API-KEY"] = OPENSEA_API_KEY;
  }
  return headers;
};

// ==========================================
// 1. 全局限流器 (Rate Limiter)
// ==========================================
class RateLimiter {
  private queue: (() => void)[] = [];
  private isProcessing = false;
  // OpenSea 免费 API 限制为 4次/秒
  private readonly MAX_RPS = 4;
  private currentRequests = 0;

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      if (this.currentRequests >= this.MAX_RPS) {
        // 达到每秒限制，等待 1 秒
        await new Promise((r) => setTimeout(r, 1000));
        this.currentRequests = 0;
      }

      const task = this.queue.shift();
      if (task) {
        this.currentRequests++;
        task(); // 异步执行，不阻塞队列
      }
    }

    this.isProcessing = false;
  }
}

export const openSeaRateLimiter = new RateLimiter();

// ==========================================
// 2. 单体查询逻辑
// ==========================================
async function fetchBestPrice(record: NameRecord, side: "listings" | "offers") {
  const tokenId = getTokenId(record);
  const contract = getContract(record);
  const url = `${OPENSEA_API_BASE_URL}/${side}/collection/ens/nfts/${tokenId}/best`;

  try {
    const res = await fetch(url, { headers: getHeaders() });

    if (!res.ok) {
      // 静默处理 404 和 429，保持控制台干净
      return null;
    }

    const data = await res.json();
    const priceObj = data?.price?.current || data?.price;

    if (!priceObj || !priceObj.value) return null;

    const currency =
      priceObj.currency || (side === "listings" ? "ETH" : "WETH");

    if (!ALLOWED_CURRENCIES.includes(currency.toUpperCase())) {
      return null;
    }

    const decimals = priceObj.decimals ?? 18;
    const value = priceObj.value;
    const amount = parseFloat(formatUnits(BigInt(value), decimals));

    return {
      amount,
      currency: currency.toUpperCase(),
      url: `${OPENSEA_WEB_BASE_URL}/assets/ethereum/${contract}/${tokenId}`,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}

// ==========================================
// 3. 暴露给 Hook 的单条记录获取函数
// ==========================================
export async function fetchSingleMarketData(
  record: NameRecord,
): Promise<SimpleMarketData | null> {
  if (!OPENSEA_API_KEY || isRegistrable(record.status)) return null;

  // 使用全局限流器包裹请求
  const [listing, offer] = await Promise.all([
    openSeaRateLimiter.enqueue(() => fetchBestPrice(record, "listings")),
    openSeaRateLimiter.enqueue(() => fetchBestPrice(record, "offers")),
  ]);

  if (!listing && !offer) return null;

  const result: SimpleMarketData = {};
  if (listing) result.listing = listing;
  if (offer) result.offer = offer;

  return result;
}
