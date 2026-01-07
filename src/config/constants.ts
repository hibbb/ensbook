/**
 * 全局应用常量配置
 */

// 🚀 定义默认时长常量（1年 = 31536000秒）
export const DEFAULT_DURATION_SECONDS = 31536000n; // 1年
export const SECONDS_PER_YEAR = 31536000n; // 365 * 24 * 60 * 60

// ENS 协议相关的常量
export const GRACE_PERIOD_DURATION = 90 * 24 * 60 * 60;
export const PREMIUM_PERIOD_DURATION = 21 * 24 * 60 * 60;
export const ETH_PARENT_HASH =
  "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";

export const GRAPHQL_CONFIG = {
  // 每次从 Subgraph 获取数据的最大数量限制，默认 1000 是 The Graph 节点的常见分页上限
  FETCH_LIMIT: 1000,
};

export const INPUT_LIMITS = {
  ADDRESS: 20,
  SAME: 20,
  PURE: 1000,
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
