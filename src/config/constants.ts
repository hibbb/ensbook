/**
 * 全局应用常量配置
 */

// 定义默认时长常量（1年 = 31536000秒）
export const DEFAULT_DURATION_SECONDS = 365 * 24 * 60 * 60; // 1年
export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 365 * 24 * 60 * 60
export const SECONDS_PER_DAY = 24 * 60 * 60;

// UI 分页大小
export const ITEMS_PER_PAGE = 50;

// ENS 协议相关的常量
export const MIN_REGISTRATION_DURATION = 28 * 24 * 60 * 60; // 2419200 秒
export const GRACE_PERIOD_DURATION = 90 * 24 * 60 * 60;
export const PREMIUM_PERIOD_DURATION = 21 * 24 * 60 * 60;
export const COMMITMENT_AGE_SECONDS = 60; // 协议规定最小 60s
export const REGISTRATION_DELAY_BUFFER = 5; // 前端额外缓冲 5s
export const ETH_PARENT_HASH =
  "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";

export const INPUT_LIMITS = {
  ADDRESS: 20,
  SAME: 20,
  PURE: 1000,
};

export const MAX_MEMO_LENGTH = 200;

export const OPENSEA_API_BASE_URL = "https://api.opensea.io/api/v2";
export const ETHERSCAN_BASE_URL = "https://etherscan.io";

export const BATCH_CONFIG = {
  RPC_LOOKUP_SIZE: 50, // viem multicall 建议值
  RPC_DELAY_MS: 100, // 防止 429 的延迟
  OPENSEA_CHUNK_SIZE: 30, // OpenSea API 限制
  GRAPH_CHUNK_SIZE: 1000, // The Graph 分页限制
};

// 每种状态的标志颜色，与 ens app 的颜色模板保持一致
export const STATUS_COLOR_BG: Record<string, string> = {
  Available: "bg-green-100",
  Active: "bg-cyan-100",
  Grace: "bg-yellow-100",
  Premium: "bg-purple-100",
  Released: "bg-green-100",
  Unknown: "bg-gray-100",
};

export const STATUS_COLOR_TEXT: Record<string, string> = {
  Available: "text-green-700",
  Active: "text-cyan-700",
  Grace: "text-yellow-700",
  Premium: "text-purple-700",
  Released: "text-green-700",
  Unknown: "text-gray-700",
};

export const STATUS_COLOR_BG_HOVER: Record<string, string> = {
  Available: "hover:bg-green-100",
  Active: "hover:bg-cyan-100",
  Grace: "hover:bg-yellow-100",
  Premium: "hover:bg-purple-100",
  Released: "hover:bg-green-100",
  Unknown: "hover:bg-gray-100",
};

export const STATUS_COLOR_TEXT_HOVER: Record<string, string> = {
  Available: "hover:text-green-700",
  Active: "hover:text-cyan-700",
  Grace: "hover:text-yellow-700",
  Premium: "hover:text-purple-700",
  Released: "hover:text-green-700",
  Unknown: "hover:text-gray-700",
};
