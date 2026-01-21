// src/services/storage/userStore.ts

import type {
  EnsBookUserData,
  UserDomainMeta,
  PageViewState,
  UserSettings,
} from "../../types/userData";
import type { EnsBookBackup } from "../../types/backup";
import i18n from "../../i18n/config"; // 🚀 引入 i18n 实例

const STORAGE_KEY = "ensbook_user_data_v2";
const MAX_MEMO_LENGTH = 200;

// 🚀 1. 定义内存缓存变量
let cachedData: EnsBookUserData | null = null;

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
    locale: "en",
    defaultDuration: 31536000,
    myCollectionSource: "",
    mineAsHomepage: false,
  },
};

// --- 内部辅助：初始化并写入 ---
const initUserData = (): EnsBookUserData => {
  // 这里直接调用底层保存，避免循环依赖
  try {
    const data = DEFAULT_DATA;
    data.timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    cachedData = data; // 更新缓存
    return data;
  } catch (e) {
    console.error("Failed to init user data:", e);
    return DEFAULT_DATA;
  }
};

// --- 基础读写 (核心优化部分) ---

export const getFullUserData = (): EnsBookUserData => {
  // 🚀 2. 优先读取内存缓存 (性能提升的关键)
  if (cachedData) {
    return cachedData;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initUserData();

    const parsed = JSON.parse(raw);
    // 深度合并默认值，确保结构完整
    const data = {
      ...DEFAULT_DATA,
      ...parsed,
      settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
      viewStates: { ...DEFAULT_DATA.viewStates, ...parsed.viewStates },
    };

    // 🚀 3. 写入缓存
    cachedData = data;
    return data;
  } catch (e) {
    console.error("Failed to load user data:", e);
    return initUserData();
  }
};

export const saveFullUserData = (data: EnsBookUserData) => {
  try {
    data.timestamp = Date.now();

    // 4. 更新内存缓存
    cachedData = data;

    // 写入硬盘
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      // 🚀 翻译错误信息
      throw new Error(i18n.t("storage.quota_exceeded"));
    }
    console.error("Failed to save user data:", e);
    throw e;
  }
};

// 🚀 5. 监听跨标签页同步 (Cross-Tab Sync)
// 当用户在 Tab A 修改数据时，Tab B 会收到 storage 事件
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      // 策略：直接清空缓存。下次读取时会重新从 LS 加载最新数据。
      // 这样可以避免复杂的合并逻辑，且保证数据绝对新鲜。
      cachedData = null;

      // 触发应用内更新事件，通知 UI 刷新
      window.dispatchEvent(new Event("user-settings-updated"));
    }
  });
}

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

export const getDomainMeta = (label: string): UserDomainMeta | undefined => {
  const data = getFullUserData();
  return data.metadata[label];
};

export const updateDomainMeta = (
  label: string,
  updates: Partial<UserDomainMeta>,
) => {
  const data = getFullUserData();
  const existing = data.metadata[label];

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

// --- Home List 操作 ---

export const getHomeLabels = (): string[] => {
  const data = getFullUserData();
  const { homeList, metadata } = data;

  return [...homeList].sort((a, b) => {
    const timeA = metadata[a]?.createdAt || 0;
    const timeB = metadata[b]?.createdAt || 0;
    return timeB - timeA;
  });
};

export const addToHome = (label: string) => {
  const data = getFullUserData();

  if (!data.metadata[label]) {
    data.metadata[label] = createMeta();
  }

  if (!data.homeList.includes(label)) {
    data.homeList.push(label);
    saveFullUserData(data);
  }
};

export const bulkAddToHome = (labels: string[]) => {
  if (labels.length === 0) return;
  const data = getFullUserData();
  let hasChanges = false;

  labels.forEach((label) => {
    if (!data.metadata[label]) {
      data.metadata[label] = createMeta();
    }
    if (!data.homeList.includes(label)) {
      data.homeList.push(label);
      hasChanges = true;
    }
  });

  if (hasChanges) saveFullUserData(data);
};

export const removeFromHome = (label: string) => {
  const data = getFullUserData();
  const index = data.homeList.indexOf(label);
  if (index > -1) {
    data.homeList.splice(index, 1);
    saveFullUserData(data);
  }
};

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

export const clearHomeList = () => {
  const data = getFullUserData();
  data.homeList = [];

  // 🚀 新增：清空 Home 列表时，同时重置 Home 的视图状态
  // 这样用户重新添加数据时，不会因为之前的筛选器而看不到数据
  data.viewStates.home = {};

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

  // 🚀 新增：如果 Source 被清空，同时也重置 Mine 的视图状态
  if (!source) {
    data.viewStates.collections["mine"] = {};
  }

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

  const currentData = getFullUserData();

  const mergedMetadata = {
    ...currentData.metadata,
    ...backup.metadata,
  };

  const mergedHomeList = Array.from(
    new Set([...currentData.homeList, ...backup.homeList]),
  );

  const mergedViewStates = {
    home: { ...currentData.viewStates.home, ...backup.viewStates.home },
    collections: {
      ...currentData.viewStates.collections,
      ...backup.viewStates.collections,
    },
  };

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

/**
 * 🚀 危险操作：重置所有用户数据 (Factory Reset)
 * 彻底清空 Metadata, HomeList, ViewStates 以及 Settings (语言/主题/自定义集合等)
 * 恢复到应用刚安装时的初始状态。
 */
export const resetUserCustomData = () => {
  // 直接使用 DEFAULT_DATA 进行全量覆盖
  // 注意：需要克隆对象并更新时间戳，防止引用污染
  const resetData: EnsBookUserData = {
    ...DEFAULT_DATA,
    timestamp: Date.now(),
  };

  saveFullUserData(resetData);
};
