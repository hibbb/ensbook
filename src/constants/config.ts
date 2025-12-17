// src/constants/config.ts

/**
 * GraphQL 查询相关的全局配置
 */
export const GRAPHQL_CONFIG = {
  /**
   * 每次从 Subgraph 获取数据的最大数量限制
   * 默认 1000 是 The Graph 节点的常见分页上限
   */
  FETCH_LIMIT: 1000,
};
