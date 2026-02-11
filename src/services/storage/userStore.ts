// src/services/storage/userStore.ts

import type {
  EnsBookUserData,
  UserDomainMeta,
  PageViewState,
  UserSettings,
} from "../../types/userData";
import type { EnsBookBackup } from "../../types/backup";
import i18n from "../../i18n/config";

const STORAGE_KEY = "ensbook_user_data_v2";
const MAX_MEMO_LENGTH = 200;

let cachedData: EnsBookUserData | null = null;

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

const initUserData = (): EnsBookUserData => {
  try {
    const data = DEFAULT_DATA;
    data.timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    cachedData = data;
    return data;
  } catch (e) {
    console.error("Failed to init user data:", e);
    return DEFAULT_DATA;
  }
};

export const getFullUserData = (): EnsBookUserData => {
  if (cachedData) {
    return cachedData;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initUserData();

    const parsed = JSON.parse(raw);
    const data = {
      ...DEFAULT_DATA,
      ...parsed,
      settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
      viewStates: { ...DEFAULT_DATA.viewStates, ...parsed.viewStates },
    };

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
    cachedData = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error(i18n.t("storage.quota_exceeded"));
    }
    console.error("Failed to save user data:", e);
    throw e;
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      cachedData = null;
      window.dispatchEvent(new Event("user-settings-updated"));
    }
  });
}

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

// 判断是否为垃圾数据，如果不在 Home 列表，且无备注、无等级，则视为垃圾
const tryCleanupMeta = (data: EnsBookUserData, label: string) => {
  const meta = data.metadata[label];
  if (!meta) return;

  // 检查是否还在 Home 列表中
  const isInHome = data.homeList.includes(label);

  // 检查是否有实质内容
  const hasContent =
    (meta.memo && meta.memo.trim().length > 0) || meta.level > 0;

  // 如果既不在列表里，也没有实质内容，就删除
  if (!isInHome && !hasContent) {
    delete data.metadata[label];
  }
};

// --- 核心业务操作 ---

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

  // 每次更新后，尝试清理
  // (例如用户清空了备注，且该域名不在 Home 列表中，则该元数据应该被删除)
  tryCleanupMeta(data, label);

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
  } else {
    // 更新时间戳以便置顶
    data.metadata[label].createdAt = Date.now();
    data.metadata[label].updatedAt = Date.now();
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
  const now = Date.now();

  labels.forEach((label) => {
    if (!data.metadata[label]) {
      data.metadata[label] = createMeta();
      hasChanges = true;
    } else {
      data.metadata[label].createdAt = now;
      data.metadata[label].updatedAt = now;
      hasChanges = true;
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

    tryCleanupMeta(data, label);

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
    labels.forEach((label) => tryCleanupMeta(data, label));

    saveFullUserData(data);
  }
};

export const clearHomeList = () => {
  const data = getFullUserData();

  const labelsToCheck = [...data.homeList];

  data.homeList = [];
  data.viewStates.home = {};

  // 遍历检查并清理
  // 因为 homeList 已经空了，所以只要没有 memo/level 的都会被删掉
  labelsToCheck.forEach((label) => tryCleanupMeta(data, label));

  saveFullUserData(data);
};

// ... (后续 ViewState, Settings, Import, Reset 等逻辑保持不变) ...
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
  if (!source) {
    data.viewStates.collections["mine"] = {};
  }
  saveFullUserData(data);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("user-settings-updated"));
  }
};

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

export const resetUserCustomData = () => {
  const resetData: EnsBookUserData = {
    ...DEFAULT_DATA,
    timestamp: Date.now(),
  };
  saveFullUserData(resetData);
};
