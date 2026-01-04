// src/services/storage/userStore.ts

import type {
  EnsBookUserData,
  UserDomainMeta,
  PageViewState,
} from "../../types/userData";
import type { EnsBookBackup } from "../../types/backup";

const STORAGE_KEY = "ensbook_user_data_v1";

const DEFAULT_DATA: EnsBookUserData = {
  version: 1,
  timestamp: 0,
  home: {
    items: {},
    viewState: {},
  },
  collections: {
    items: {},
    viewStates: {},
  },
  settings: {
    theme: "system",
    locale: "zh",
    defaultDuration: 31536000,
  },
};

// --- 基础读写 ---

export const getFullUserData = (): EnsBookUserData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initUserData();
    const data = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...data };
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

// --- 核心业务操作 ---

export const getHomeLabels = (): string[] => {
  const data = getFullUserData();
  return Object.keys(data.home.items).sort(
    (a, b) => data.home.items[b].createdAt - data.home.items[a].createdAt,
  );
};

export const getHomeItem = (label: string): UserDomainMeta | undefined => {
  const data = getFullUserData();
  return data.home.items[label];
};

export const updateHomeItem = (
  label: string,
  updates: Partial<UserDomainMeta>,
) => {
  const data = getFullUserData();
  const existing = data.home.items[label];
  if (existing) {
    data.home.items[label] = { ...existing, ...updates, updatedAt: Date.now() };
  } else {
    data.home.items[label] = createMeta(updates);
  }
  saveFullUserData(data);
};

export const removeHomeItem = (label: string) => {
  const data = getFullUserData();
  if (data.home.items[label]) {
    delete data.home.items[label];
    saveFullUserData(data);
  }
};

// 批量操作

export const bulkUpdateHomeItems = (
  labels: string[],
  updates: Partial<UserDomainMeta> = {},
) => {
  if (labels.length === 0) return;
  const data = getFullUserData();
  const now = Date.now();
  labels.forEach((label) => {
    const existing = data.home.items[label];
    if (existing) {
      data.home.items[label] = { ...existing, ...updates, updatedAt: now };
    } else {
      data.home.items[label] = createMeta(updates);
    }
  });
  saveFullUserData(data);
};

export const bulkRemoveHomeItems = (labels: string[]) => {
  if (labels.length === 0) return;
  const data = getFullUserData();
  let hasChanges = false;
  labels.forEach((label) => {
    if (data.home.items[label]) {
      delete data.home.items[label];
      hasChanges = true;
    }
  });
  if (hasChanges) saveFullUserData(data);
};

export const clearHomeItems = () => {
  const data = getFullUserData();
  data.home.items = {};
  saveFullUserData(data);
};

export const updateCollectionItem = (
  label: string,
  updates: Partial<UserDomainMeta>,
) => {
  const data = getFullUserData();
  const existing = data.collections.items[label];
  if (existing) {
    data.collections.items[label] = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
  } else {
    data.collections.items[label] = createMeta(updates);
  }
  saveFullUserData(data);
};

export const getCollectionItem = (
  label: string,
): UserDomainMeta | undefined => {
  const data = getFullUserData();
  return data.collections.items[label];
};

export const getItemByContext = (
  context: "home" | "collection",
  label: string,
): UserDomainMeta | undefined => {
  return context === "home" ? getHomeItem(label) : getCollectionItem(label);
};

// 🚀 新增：视图状态持久化逻辑

export const getHomeViewState = (): PageViewState => {
  const data = getFullUserData();
  return data.home.viewState || {};
};

export const saveHomeViewState = (viewState: PageViewState) => {
  const data = getFullUserData();
  data.home.viewState = viewState;
  saveFullUserData(data);
};

export const getCollectionViewState = (collectionId: string): PageViewState => {
  const data = getFullUserData();
  return data.collections.viewStates[collectionId] || {};
};

export const saveCollectionViewState = (
  collectionId: string,
  viewState: PageViewState,
) => {
  const data = getFullUserData();
  data.collections.viewStates[collectionId] = viewState;
  saveFullUserData(data);
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

  // 1. 合并 Home
  const mergedHomeItems = {
    ...currentData.home.items,
    ...backup.home.items,
  };
  // 🚀 合并 Home 视图状态 (导入优先)
  const mergedHomeViewState = {
    ...currentData.home.viewState,
    ...backup.home.viewState,
  };

  // 2. 合并 Collection
  const mergedCollectionItems = {
    ...currentData.collections.items,
    ...backup.collections.items,
  };
  // 🚀 合并 Collection 视图状态
  const mergedCollectionViewStates = {
    ...currentData.collections.viewStates,
    ...backup.collections.viewStates,
  };

  // 3. 合并设置
  const mergedSettings = {
    ...currentData.settings,
    ...backup.settings,
  };

  // 4. 构建最终数据
  const mergedData: EnsBookUserData = {
    ...currentData,
    home: {
      items: mergedHomeItems,
      viewState: mergedHomeViewState, // 🚀
    },
    collections: {
      items: mergedCollectionItems,
      viewStates: mergedCollectionViewStates, // 🚀
    },
    settings: mergedSettings,
    timestamp: Date.now(),
  };

  saveFullUserData(mergedData);
};
