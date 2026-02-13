// src/config/env.ts

// ----------------------------------------------------------------
// 1. 基础设施与 RPC (Infrastructure)
// ----------------------------------------------------------------

export const WALLET_CONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "";
export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "";

if (!WALLET_CONNECT_PROJECT_ID) {
  console.warn(
    "VITE_WALLET_CONNECT_PROJECT_ID is missing. Wallet connection may fail.",
  );
}

// ----------------------------------------------------------------
// 2. 数据索引服务 (The Graph)
// ----------------------------------------------------------------

const subgraphApiKey = import.meta.env.VITE_SUBGRAPH_API_KEY;
if (!subgraphApiKey) {
  throw new Error("The VITE_SUBGRAPH_API_KEY environment variable is missing");
}

const ENS_SUBGRAPH_ID = "5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH";

export const SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/${ENS_SUBGRAPH_ID}`;

// ----------------------------------------------------------------
// 3. 市场与浏览器 (Market & Explorers)
// ----------------------------------------------------------------

export const OPENSEA_API_KEY = import.meta.env.VITE_OPENSEA_API_KEY || "";

// 即使是 URL，放在这里也方便未来根据环境切换 (如 Testnet 使用不同的 URL)
export const OPENSEA_API_BASE_URL = "https://api.opensea.io/api/v2";
export const OPENSEA_WEB_BASE_URL = "https://opensea.io";

export const ETHERSCAN_BASE_URL = "https://etherscan.io";
