// src/config/constants.ts

import { type Hex, pad } from "viem";

// ----------------------------------------------------------------
// 1. 业务逻辑配置 (Business Logic)
// ----------------------------------------------------------------

// Referrer 地址
const RAW_REFERRER = "0x9c6aa5ce4903aad922ac4dde9b57817c1fc17d9b";
export const REFERRER_ADDRESS_HASH: Hex = pad(
  RAW_REFERRER.toLowerCase() as Hex,
  { size: 32 },
);

// 系统限制
export const MAX_MEMO_LENGTH = 200;

export const INPUT_LIMITS = {
  ADDRESS: 20,
  SAME: 20,
  PURE: 1000,
};

// ----------------------------------------------------------------
// 2. 时间与协议常量 (Time & Protocol)
// ----------------------------------------------------------------

export const SECONDS_PER_DAY = 24 * 60 * 60;
export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
export const DEFAULT_DURATION_SECONDS = SECONDS_PER_YEAR;

// ENS 协议参数
export const MIN_REGISTRATION_DURATION = 28 * 24 * 60 * 60; // 28天
export const GRACE_PERIOD_DURATION = 90 * 24 * 60 * 60; // 90天
export const PREMIUM_PERIOD_DURATION = 21 * 24 * 60 * 60; // 21天
export const ETH_PARENT_HASH =
  "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";

// 注册流程时间控制
export const COMMITMENT_AGE_SECONDS = 60;
export const REGISTRATION_DELAY_BUFFER = 5;

// ----------------------------------------------------------------
// 3. 性能调优 (Performance Tuning)
// ----------------------------------------------------------------

export const GRAPHQL_CONFIG = {
  FETCH_LIMIT: 1000,
};

export const BATCH_CONFIG = {
  RPC_LOOKUP_SIZE: 50, // viem multicall 建议值
  RPC_DELAY_MS: 100, // 防止 429 的延迟
  OPENSEA_CHUNK_SIZE: 30, // OpenSea API 限制
  GRAPH_CHUNK_SIZE: 1000, // The Graph 分页限制
};

export const ITEMS_PER_PAGE = 50;

// ----------------------------------------------------------------
// 4. UI 样式常量 (UI Styles)
// ----------------------------------------------------------------

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
