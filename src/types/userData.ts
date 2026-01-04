// src/types/userData.ts

import type { SortConfig, FilterConfig } from "../components/NameTable/types";

/**
 * 单个域名的用户自定义元数据 (原子单位)
 */
export interface UserDomainMeta {
  /**
   * 备注信息
   * 必填字符串，无备注时存为 ""
   */
  memo: string;

  /**
   * 关注等级
   * 必填项，默认 0。
   * 0: 无/默认, 1: 关注, 2: 重点...
   */
  level: number;

  /**
   * 创建时间 (加入列表或首次修改备注的时间)
   */
  createdAt: number;

  /**
   * 最后修改时间
   */
  updatedAt: number;
}

/**
 * 页面视图状态 (用于恢复用户上次的筛选和排序)
 */
export interface PageViewState {
  sort?: SortConfig;
  filter?: FilterConfig;
}

/**
 * 用户设置
 */
export interface UserSettings {
  theme: "light" | "dark" | "system";
  locale: "zh" | "en";
  defaultDuration: number;
}

/**
 * 核心存储结构 (Root Object)
 */
export interface EnsBookUserData {
  version: number;
  timestamp: number;

  // --- 上下文 A: Home (我的关注列表) ---
  home: {
    // Key: label (如 "001") -> Value: Meta
    items: Record<string, UserDomainMeta>;

    // Home 页面的视图状态
    viewState: PageViewState;
  };

  // --- 上下文 B: 集合浏览 (公共浏览记录) ---
  collections: {
    // Key: label -> Value: Meta
    items: Record<string, UserDomainMeta>;

    // 视图状态映射表: collectionId -> ViewState
    viewStates: Record<string, PageViewState>;
  };

  // 全局设置
  settings: UserSettings;
}
