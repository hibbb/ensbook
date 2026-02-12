// src/config/env.ts
import { type Hex, pad } from "viem";

const rawReferrer = "0x9c6aa5ce4903aad922ac4dde9b57817c1fc17d9b";

// 预先计算并导出，Hook 中直接使用，无需重复计算
export const REFERRER_ADDRESS_HASH: Hex = pad(
  rawReferrer.toLowerCase() as Hex,
  {
    size: 32,
  },
);

// Subgraph API Key 配置
const subgraphApiKey = import.meta.env.VITE_SUBGRAPH_API_KEY;
if (!subgraphApiKey) {
  // 这里抛出错误是合理的，因为没有它程序无法运行
  throw new Error("The VITE_SUBGRAPH_API_KEY environment variable is missing");
}

// ENS Mainnet Subgraph ID (The Graph Network)
const ENS_SUBGRAPH_ID = "5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH";

export const SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/${ENS_SUBGRAPH_ID}`;
