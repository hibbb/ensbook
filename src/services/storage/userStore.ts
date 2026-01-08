// src/services/storage/userStore.ts

import type {
  EnsBookUserData,
  UserDomainMeta,
  PageViewState,
  UserSettings,
} from "../../types/userData";
import type { EnsBookBackup } from "../../types/backup";

const STORAGE_KEY = "ensbook_user_data_v2"; // 🚀 升级 Key 以区分新旧结构
const MAX_MEMO_LENGTH = 200;

// 初始化默认数据
const DEFAULT_DATA: EnsBookUserData = {
  version: 2,
  timestamp: 0,
  metadata: {},
  homeList: [],
  viewStates: {
    home: {},
    collections: {},
  },
  settings: {
    theme: "system",
    locale: "zh",
    defaultDuration: 31536000,
    myCollectionSource: "",
    mineAsHomepage: false,
  },
};

// --- 基础读写 ---

export const getFullUserData = (): EnsBookUserData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initUserData();
    const data = JSON.parse(raw);
    // 深度合并默认值，确保结构完整
    return {
      ...DEFAULT_DATA,
      ...data,
      settings: { ...DEFAULT_DATA.settings, ...data.settings },
      viewStates: { ...DEFAULT_DATA.viewStates, ...data.viewStates },
    };
  } catch (e) {
    console.error("Failed to load user data:", e);
    return initUserData();
  }
};

export const saveFullUserData = (data: EnsBookUserData) => {
  try {
    data.timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save user data:", e);
    throw e;
  }
};

const initUserData = (): EnsBookUserData => {
  saveFullUserData(DEFAULT_DATA);
  return DEFAULT_DATA;
};

// 辅助：创建新的元数据对象
const createMeta = (partial?: Partial<UserDomainMeta>): UserDomainMeta => {
  const now = Date.now();
  return {
    memo: "",
    level: 0,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
};

// --- 核心业务操作 (Global Metadata) ---

/**
 * 获取单个域名的元数据 (Memo, Level)
 */
export const getDomainMeta = (label: string): UserDomainMeta | undefined => {
  const data = getFullUserData();
  return data.metadata[label];
};

/**
 * 更新域名的元数据 (Memo, Level)
 * 如果域名不存在于 metadata 中，会自动创建
 */
export const updateDomainMeta = (
  label: string,
  updates: Partial<UserDomainMeta>,
) => {
  const data = getFullUserData();
  const existing = data.metadata[label];

  // 处理 Memo 字数限制
  if (typeof updates.memo === "string") {
    updates.memo = updates.memo.trim().slice(0, MAX_MEMO_LENGTH);
  }

  if (existing) {
    data.metadata[label] = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
  } else {
    data.metadata[label] = createMeta(updates);
  }
  saveFullUserData(data);
};

// --- Home List 操作 (引用管理) ---

/**
 * 获取 Home 关注列表
 * 返回按 metadata.createdAt 倒序排列的 label 数组
 */
export const getHomeLabels = (): string[] => {
  const data = getFullUserData();
  const { homeList, metadata } = data;

  return [...homeList].sort((a, b) => {
    const timeA = metadata[a]?.createdAt || 0;
    const timeB = metadata[b]?.createdAt || 0;
    return timeB - timeA; // 新的在前
  });
};

/**
 * 添加域名到 Home 列表
 * 同时确保 metadata 中有记录
 */
export const addToHome = (label: string) => {
  const data = getFullUserData();

  // 1. 确保 metadata 存在
  if (!data.metadata[label]) {
    data.metadata[label] = createMeta();
  }

  // 2. 添加到列表 (去重)
  if (!data.homeList.includes(label)) {
    data.homeList.push(label);
    saveFullUserData(data);
  }
};

/**
 * 批量添加域名到 Home
 */
export const bulkAddToHome = (labels: string[]) => {
  if (labels.length === 0) return;
  const data = getFullUserData();
  let hasChanges = false;

  labels.forEach((label) => {
    // 1. Init Metadata
    if (!data.metadata[label]) {
      data.metadata[label] = createMeta();
    }
    // 2. Add to List
    if (!data.homeList.includes(label)) {
      data.homeList.push(label);
      hasChanges = true;
    }
  });

  if (hasChanges) saveFullUserData(data);
};

/**
 * 从 Home 列表移除域名
 * 注意：不删除 metadata，保留备注以防用户以后重新添加
 */
export const removeFromHome = (label: string) => {
  const data = getFullUserData();
  const index = data.homeList.indexOf(label);
  if (index > -1) {
    data.homeList.splice(index, 1);
    saveFullUserData(data);
  }
};

/**
 * 批量移除
 */
export const bulkRemoveFromHome = (labels: string[]) => {
  if (labels.length === 0) return;
  const data = getFullUserData();
  const set = new Set(labels);

  const initialLen = data.homeList.length;
  data.homeList = data.homeList.filter((l) => !set.has(l));

  if (data.homeList.length !== initialLen) {
    saveFullUserData(data);
  }
};

/**
 * 清空 Home 列表
 */
export const clearHomeList = () => {
  const data = getFullUserData();
  data.homeList = [];
  saveFullUserData(data);
};

// --- 视图状态操作 ---

export const getHomeViewState = (): PageViewState => {
  return getFullUserData().viewStates.home || {};
};

export const saveHomeViewState = (viewState: PageViewState) => {
  const data = getFullUserData();
  data.viewStates.home = viewState;
  saveFullUserData(data);
};

export const getCollectionViewState = (collectionId: string): PageViewState => {
  return getFullUserData().viewStates.collections[collectionId] || {};
};

export const saveCollectionViewState = (
  collectionId: string,
  viewState: PageViewState,
) => {
  const data = getFullUserData();
  data.viewStates.collections[collectionId] = viewState;
  saveFullUserData(data);
};

// --- 设置操作 ---

export const getUserSettings = (): UserSettings => {
  return getFullUserData().settings;
};

export const updateSettings = (updates: Partial<UserSettings>) => {
  const data = getFullUserData();
  data.settings = { ...data.settings, ...updates };
  saveFullUserData(data);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("user-settings-updated"));
  }
};

export const getMyCollectionSource = (): string => {
  return getFullUserData().settings.myCollectionSource || "";
};

export const saveMyCollectionSource = (source: string) => {
  const data = getFullUserData();
  data.settings.myCollectionSource = source;
  saveFullUserData(data);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("user-settings-updated"));
  }
};

// --- 导入逻辑 ---

export const importUserData = (
  backup: EnsBookBackup,
  mode: "merge" | "overwrite",
) => {
  if (mode === "overwrite") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { source, ...dataToSave } = backup;
    saveFullUserData(dataToSave);
    return;
  }

  // 合并模式
  const currentData = getFullUserData();

  // 1. 合并 Metadata (覆盖式更新)
  const mergedMetadata = {
    ...currentData.metadata,
    ...backup.metadata,
  };

  // 2. 合并 HomeList (去重)
  const mergedHomeList = Array.from(
    new Set([...currentData.homeList, ...backup.homeList]),
  );

  // 3. 合并 ViewStates
  const mergedViewStates = {
    home: { ...currentData.viewStates.home, ...backup.viewStates.home },
    collections: {
      ...currentData.viewStates.collections,
      ...backup.viewStates.collections,
    },
  };

  // 4. 合并 Settings
  const mergedSettings = {
    ...currentData.settings,
    ...backup.settings,
  };

  const mergedData: EnsBookUserData = {
    version: 2,
    timestamp: Date.now(),
    metadata: mergedMetadata,
    homeList: mergedHomeList,
    viewStates: mergedViewStates,
    settings: mergedSettings,
  };

  saveFullUserData(mergedData);
};
