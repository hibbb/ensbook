// src/services/storage/userStore.ts

import type {
  EnsBookUserData,
  UserDomainMeta,
  PageViewState,
  UserSettings,
} from "../../types/userData";
import type { EnsBookBackup } from "../../types/backup";
import i18n from "../../i18n/config";

// 1. 升级 Key 和 Version
const STORAGE_KEY = "ensbook_user_data_v3";
const CURRENT_VERSION = 3;
const MAX_MEMO_LENGTH = 200;

let cachedData: EnsBookUserData | null = null;

// 2. 更新默认数据结构
const DEFAULT_DATA: EnsBookUserData = {
  version: CURRENT_VERSION,
  timestamp: 0,
  metadata: {},
  homeList: [],
  viewStates: {}, // 扁平化，不再区分 home/collections
  settings: {
    theme: "system",
    locale: "en",
    defaultDuration: 31536000,
    myCollectionSource: "",
    mineAsHomepage: false,
  },
};

// 3. 数据迁移逻辑 (V2 -> V3)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrateData = (oldData: any): EnsBookUserData => {
  if (oldData.version === CURRENT_VERSION) {
    return oldData as EnsBookUserData;
  }

  console.log(
    `Migrating user data from v${oldData.version} to v${CURRENT_VERSION}...`,
  );

  // 1. 基于默认数据构建新对象
  const newData: EnsBookUserData = { ...DEFAULT_DATA };

  // 2. 安全地迁移核心数据 (Metadata & HomeList & Settings)
  if (oldData.metadata) newData.metadata = { ...oldData.metadata };
  if (Array.isArray(oldData.homeList)) newData.homeList = [...oldData.homeList];
  if (oldData.settings)
    newData.settings = { ...DEFAULT_DATA.settings, ...oldData.settings };

  // 3. 迁移并扁平化 ViewStates (核心变更)
  if (oldData.viewStates) {
    const flatViewStates: Record<string, PageViewState> = {};

    // 迁移 Home
    if (oldData.viewStates.home) {
      flatViewStates["home"] = oldData.viewStates.home;
    }
    // 迁移 Collections
    if (oldData.viewStates.collections) {
      Object.assign(flatViewStates, oldData.viewStates.collections);
    }

    newData.viewStates = flatViewStates;
  }

  // 4. 强制更新版本号和时间戳
  newData.version = CURRENT_VERSION;
  newData.timestamp = Date.now();

  return newData;
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
    // 尝试读取 V3
    const raw = localStorage.getItem(STORAGE_KEY);

    // 如果 V3 不存在，尝试读取 V2 (为了迁移)
    if (!raw) {
      const v2Raw = localStorage.getItem("ensbook_user_data_v2");
      if (v2Raw) {
        const v2Data = JSON.parse(v2Raw);
        const v3Data = migrateData(v2Data);
        saveFullUserData(v3Data); // 保存为 V3
        return v3Data;
      }
      // 如果 V2 也没有，初始化新的
      return initUserData();
    }

    const parsed = JSON.parse(raw);

    // 运行时再次检查版本，防止读取到旧结构的脏数据
    if (parsed.version < CURRENT_VERSION) {
      const migrated = migrateData(parsed);
      saveFullUserData(migrated);
      return migrated;
    }

    const data = {
      ...DEFAULT_DATA,
      ...parsed,
      settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
      // 确保 viewStates 是对象
      viewStates: parsed.viewStates || {},
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

// ... (Window storage event listener 保持不变)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      cachedData = null;
      window.dispatchEvent(new Event("user-settings-updated"));
    }
  });
}

// ... (createMeta, tryCleanupMeta, getDomainMeta, updateDomainMeta 等元数据操作保持不变)
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

const tryCleanupMeta = (data: EnsBookUserData, label: string) => {
  const meta = data.metadata[label];
  if (!meta) return;
  const isInHome = data.homeList.includes(label);
  const hasContent =
    (meta.memo && meta.memo.trim().length > 0) || meta.level > 0;
  if (!isInHome && !hasContent) {
    delete data.metadata[label];
  }
};

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
    data.metadata[label] = { ...existing, ...updates, updatedAt: Date.now() };
  } else {
    data.metadata[label] = createMeta(updates);
  }
  tryCleanupMeta(data, label);
  saveFullUserData(data);
};

// ... (Home List 操作: getHomeLabels, addToHome, bulkAddToHome, removeFromHome, bulkRemoveFromHome, clearHomeList 保持不变)
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
  // 清空 Home 列表时，同时也重置 Home 的视图状态
  if (data.viewStates["home"]) {
    data.viewStates["home"] = {};
  }
  labelsToCheck.forEach((label) => tryCleanupMeta(data, label));
  saveFullUserData(data);
};

// 4. 统一的 ViewState 存取接口 (替代原有的 getHome/getCollection)
export const getViewState = (key: string): PageViewState => {
  return getFullUserData().viewStates[key] || {};
};

export const saveViewState = (key: string, viewState: PageViewState) => {
  const data = getFullUserData();
  data.viewStates[key] = viewState;
  saveFullUserData(data);
};

// ... (Settings 操作保持不变)
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
    // 如果清空了源，也清空对应的视图状态
    delete data.viewStates["mine"];
  }
  saveFullUserData(data);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("user-settings-updated"));
  }
};

// 5. 更新导入逻辑以支持 V3
export const importUserData = (
  backup: EnsBookBackup,
  mode: "merge" | "overwrite",
) => {
  // 先尝试迁移备份数据到 V3 格式
  const migratedBackup = migrateData(backup);

  if (mode === "overwrite") {
    // 将 migratedBackup 断言为 EnsBookBackup (或 any)，以便解构 source
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { source, ...dataToSave } =
      migratedBackup as unknown as EnsBookBackup;

    saveFullUserData(dataToSave);
    return;
  }

  const currentData = getFullUserData();

  const mergedMetadata = {
    ...currentData.metadata,
    ...migratedBackup.metadata,
  };

  const mergedHomeList = Array.from(
    new Set([...currentData.homeList, ...migratedBackup.homeList]),
  );

  // 扁平化合并
  const mergedViewStates = {
    ...currentData.viewStates,
    ...migratedBackup.viewStates,
  };

  const mergedSettings = {
    ...currentData.settings,
    ...migratedBackup.settings,
  };

  const mergedData: EnsBookUserData = {
    version: CURRENT_VERSION,
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
