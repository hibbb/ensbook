/**
 * 全局应用常量配置
 */

export const GRAPHQL_CONFIG = {
  /**
   * 每次从 Subgraph 获取数据的最大数量限制
   * 默认 1000 是 The Graph 节点的常见分页上限
   */
  FETCH_LIMIT: 1000,
};

// 每种状态的标志颜色，与 ens app 的颜色模板保持一致
export const STATUS_COLOR_BG: Record<string, string> = {
  Available: "bg-green-200",
  Active: "bg-cyan-200",
  Grace: "bg-yellow-200",
  Premium: "bg-purple-200",
  Released: "bg-green-200",
};

export const STATUS_COLOR_TEXT: Record<string, string> = {
  Available: "text-green-700",
  Active: "text-cyan-700",
  Grace: "text-yellow-700",
  Premium: "text-purple-700",
  Released: "text-green-700",
};

export const STATUS_COLOR_BG_HOVER: Record<string, string> = {
  Available: "hover:bg-green-200",
  Active: "hover:bg-cyan-200",
  Grace: "hover:bg-yellow-200",
  Premium: "hover:bg-purple-200",
  Released: "hover:bg-green-200",
};

export const STATUS_COLOR_TEXT_HOVER: Record<string, string> = {
  Available: "hover:text-green-700",
  Active: "hover:text-cyan-700",
  Grace: "hover:text-yellow-700",
  Premium: "hover:text-purple-700",
  Released: "hover:text-green-700",
};
