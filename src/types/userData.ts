// src/types/userData.ts

import type { SortConfig, FilterConfig } from "../components/NameTable/types";

/**
 * 单个域名的用户自定义元数据 (原子单位)
 */
export interface UserDomainMeta {
  /**
   * 备注信息
   */
  memo: string;

  /**
   * 关注等级 (0: Default, 1: Blue, 2: Yellow, 3: Red)
   */
  level: number;

  /**
   * 创建时间 (首次产生交互的时间)
   */
  createdAt: number;

  /**
   * 最后修改时间
   */
  updatedAt: number;
}

/**
 * 页面视图状态
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
  myCollectionSource: string;
  mineAsHomepage: boolean;
}

/**
 * 核心存储结构 (Root Object) - V2
 */
export interface EnsBookUserData {
  version: number;
  timestamp: number;

  // 🟢 全局元数据池
  // 存储所有被用户“触碰过”的域名信息 (Key: label)
  metadata: Record<string, UserDomainMeta>;

  // 🟢 Home 关注列表
  // 仅存储 Label 字符串，作为对 metadata 的引用
  homeList: string[];

  // 视图状态
  viewStates: {
    home: PageViewState;
    collections: Record<string, PageViewState>;
  };

  // 全局设置
  settings: UserSettings;
}
