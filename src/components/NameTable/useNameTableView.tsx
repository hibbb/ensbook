// src/components/NameTable/useNameTableView.tsx

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { NameRecord } from "../../types/ensNames";
import { isRenewable, isRegistrable } from "../../utils/ens";
import type { SortField, SortConfig, FilterConfig } from "./types";
import { processNameRecords } from "./utils";
import {
  getHomeViewState,
  saveHomeViewState,
  getCollectionViewState,
  saveCollectionViewState,
} from "../../services/storage/userStore";
import type { PageViewState } from "../../types/userData";

// 🚀 导出默认值
export const DEFAULT_SORT: SortConfig = { field: "status", direction: null };
export const DEFAULT_FILTER: FilterConfig = {
  statusList: [],
  onlyMe: false,
  onlyWithMemos: false,
  actionType: "all",
  lengthList: [],
  wrappedType: "all",
  levelList: [],
};

export const useNameTableView = (
  records: NameRecord[] | undefined,
  currentAddress?: string,
  context?: "home" | "collection",
  collectionId?: string,
) => {
  const getSavedState = useCallback((): PageViewState => {
    if (context === "home") return getHomeViewState();
    if (context === "collection" && collectionId)
      return getCollectionViewState(collectionId);
    return {};
  }, [context, collectionId]);

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const saved = getSavedState();
    return saved.sort || DEFAULT_SORT;
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>(() => {
    const saved = getSavedState();
    return { ...DEFAULT_FILTER, ...(saved.filter || {}) };
  });

  const currentKey = `${context}-${collectionId}`;
  const [prevKey, setPrevKey] = useState(currentKey);

  if (prevKey !== currentKey) {
    const saved = getSavedState();
    setSortConfig(saved.sort || DEFAULT_SORT);
    setFilterConfig({ ...DEFAULT_FILTER, ...(saved.filter || {}) });
    setPrevKey(currentKey);
  }

  // 🚀 Fix 1: 使用 Ref 标记是否为当前 Hook 触发的写入
  // 防止 "Hook Update -> Write -> Event -> Hook Read" 的死循环
  const isInternalWrite = useRef(false);

  useEffect(() => {
    if (!context) return;
    const viewState: PageViewState = { sort: sortConfig, filter: filterConfig };

    // 标记开始写入
    isInternalWrite.current = true;
    try {
      if (context === "home") {
        saveHomeViewState(viewState);
      } else if (context === "collection" && collectionId) {
        saveCollectionViewState(collectionId, viewState);
      }
    } catch (e) {
      console.warn("Failed to save view state:", e);
    } finally {
      // 写入完成后（事件触发后），释放标记
      // 使用 setTimeout 确保在当前事件循环结束后执行，
      // 这样能保证 user-settings-updated 的监听器已经被触发并处理完毕
      setTimeout(() => {
        isInternalWrite.current = false;
      }, 0);
    }
  }, [sortConfig, filterConfig, context, collectionId]);

  // 🚀 Fix 2: 监听外部存储更新 (解决脏回写问题的根源)
  useEffect(() => {
    const handleExternalUpdate = () => {
      // 如果这次更新是我们自己触发的，直接忽略
      if (isInternalWrite.current) return;

      const saved = getSavedState();

      // 检查存储是否被“重置” (例如被 clearHomeList 或 saveMyCollectionSource("") 清空)
      // 如果存储中没有任何 filter/sort 记录，说明它被重置了
      const isStorageReset = !saved.filter && !saved.sort;

      if (isStorageReset) {
        // 强制重置内存状态，与硬盘同步
        setSortConfig(DEFAULT_SORT);
        setFilterConfig(DEFAULT_FILTER);
      }
    };

    window.addEventListener("user-settings-updated", handleExternalUpdate);
    window.addEventListener("storage", (e) => {
      // 兼容跨标签页同步
      if (e.key && e.key.includes("ensbook_user_data")) {
        handleExternalUpdate();
      }
    });

    return () => {
      window.removeEventListener("user-settings-updated", handleExternalUpdate);
      window.removeEventListener("storage", handleExternalUpdate);
    };
  }, [getSavedState]);

  // 🚀 核心修复：更新脏检查逻辑
  const isViewStateDirty = useMemo(() => {
    const isSortDirty = (() => {
      if (sortConfig.direction === null && DEFAULT_SORT.direction === null) {
        return false;
      }
      return (
        sortConfig.field !== DEFAULT_SORT.field ||
        sortConfig.direction !== DEFAULT_SORT.direction
      );
    })();

    const isFilterDirty =
      filterConfig.onlyMe !== DEFAULT_FILTER.onlyMe ||
      filterConfig.onlyWithMemos !== DEFAULT_FILTER.onlyWithMemos ||
      filterConfig.actionType !== DEFAULT_FILTER.actionType ||
      filterConfig.wrappedType !== DEFAULT_FILTER.wrappedType ||
      (filterConfig.statusList?.length || 0) > 0 ||
      (filterConfig.lengthList?.length || 0) > 0 ||
      (filterConfig.levelList?.length || 0) > 0;

    return isSortDirty || isFilterDirty;
  }, [sortConfig, filterConfig]);

  // 重置视图
  const resetViewState = useCallback(() => {
    setSortConfig(DEFAULT_SORT);
    setFilterConfig(DEFAULT_FILTER);
  }, []);

  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  const {
    statusList = [],
    actionType = "all",
    onlyMe = false,
    lengthList = [],
    wrappedType = "all",
    levelList = [],
  } = filterConfig;

  // --- 基础过滤 ---
  const baseRecords = useMemo(() => {
    if (!records) return [];
    const lowerCurrentAddress = currentAddress?.toLowerCase();
    if (onlyMe && lowerCurrentAddress) {
      return records.filter(
        (r) => r.owner?.toLowerCase() === lowerCurrentAddress,
      );
    }
    return records;
  }, [records, onlyMe, currentAddress]);

  // --- 统计计数 ---
  const { statusCounts, actionCounts, nameCounts, levelCounts } =
    useMemo(() => {
      const checkStatus = (r: NameRecord) =>
        statusList.length === 0 || statusList.includes(r.status);
      const checkAction = (r: NameRecord) => {
        if (actionType === "all") return true;
        if (actionType === "renew") return isRenewable(r.status);
        if (actionType === "register") return isRegistrable(r.status);
        return false;
      };
      const checkLength = (r: NameRecord) =>
        lengthList.length === 0 || lengthList.includes(r.label.length);
      const checkWrapped = (r: NameRecord) => {
        if (wrappedType === "all") return true;
        return wrappedType === "wrapped" ? r.wrapped : !r.wrapped;
      };
      const checkMemos = (r: NameRecord) => {
        if (!filterConfig.onlyWithMemos) return true;
        return !!r.memo && r.memo.trim().length > 0;
      };
      const checkLevel = (r: NameRecord) =>
        levelList.length === 0 || levelList.includes(r.level || 0);

      const passOthers = (
        r: NameRecord,
        exclude: (
          | "status"
          | "action"
          | "length"
          | "wrapped"
          | "memo"
          | "level"
        )[],
      ) => {
        if (!exclude.includes("status") && !checkStatus(r)) return false;
        if (!exclude.includes("action") && !checkAction(r)) return false;
        if (!exclude.includes("length") && !checkLength(r)) return false;
        if (!exclude.includes("wrapped") && !checkWrapped(r)) return false;
        if (!exclude.includes("memo") && !checkMemos(r)) return false;
        if (!exclude.includes("level") && !checkLevel(r)) return false;
        return true;
      };

      const statusCounts: Record<string, number> = {};
      baseRecords
        .filter((r) => passOthers(r, ["status"]))
        .forEach(
          (r) => (statusCounts[r.status] = (statusCounts[r.status] || 0) + 1),
        );

      const recordsForAction = baseRecords.filter((r) =>
        passOthers(r, ["action"]),
      );
      const actionCounts = {
        all: recordsForAction.length,
        register: recordsForAction.filter((r) => isRegistrable(r.status))
          .length,
        renew: recordsForAction.filter((r) => isRenewable(r.status)).length,
      };

      const lengthCounts: Record<number, number> = {};
      const availableLengths = new Set<number>();
      baseRecords.forEach((r) => availableLengths.add(r.label.length));
      baseRecords
        .filter((r) => passOthers(r, ["length"]))
        .forEach(
          (r) =>
            (lengthCounts[r.label.length] =
              (lengthCounts[r.label.length] || 0) + 1),
        );

      const recordsForWrapped = baseRecords.filter((r) =>
        passOthers(r, ["wrapped"]),
      );
      const wrappedCounts = {
        all: recordsForWrapped.length,
        wrapped: recordsForWrapped.filter((r) => r.wrapped).length,
        unwrapped: recordsForWrapped.filter((r) => !r.wrapped).length,
      };

      const recordsWithMemos = baseRecords.filter(
        (r) => passOthers(r, ["memo"]) && !!r.memo && r.memo.trim().length > 0,
      );
      const memosCount = recordsWithMemos.length;

      const levelCounts: Record<number, number> = {};
      baseRecords
        .filter((r) => passOthers(r, ["level"]))
        .forEach(
          (r) =>
            (levelCounts[r.level || 0] = (levelCounts[r.level || 0] || 0) + 1),
        );

      return {
        statusCounts,
        actionCounts,
        nameCounts: {
          lengthCounts,
          availableLengths: Array.from(availableLengths).sort((a, b) => a - b),
          wrappedCounts,
          memosCount,
        },
        levelCounts,
      };
    }, [
      baseRecords,
      statusList,
      actionType,
      lengthList,
      wrappedType,
      filterConfig.onlyWithMemos,
      levelList,
    ]);

  const processedRecords = useMemo(
    () =>
      processNameRecords(baseRecords, sortConfig, filterConfig, currentAddress),
    [baseRecords, sortConfig, filterConfig, currentAddress],
  );

  const handleSort = useCallback((field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field !== field) return { field, direction: "asc" };
      if (prev.direction === null) return { field, direction: "asc" };
      if (prev.direction === "asc") return { field, direction: "desc" };
      if (prev.direction === "desc") return { field, direction: null };
      return { field, direction: "asc" };
    });
  }, []);

  const toggleSelection = useCallback((label: string) => {
    setSelectedLabels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) newSet.delete(label);
      else newSet.add(label);
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedLabels(new Set()), []);

  const toggleSelectAll = useCallback(() => {
    const renewableInView = processedRecords.filter((r) =>
      isRenewable(r.status),
    );
    if (renewableInView.length === 0) return;
    const allSelected = renewableInView.every((r) =>
      selectedLabels.has(r.label),
    );
    if (allSelected) {
      clearSelection();
    } else {
      setSelectedLabels((prev) => {
        const newSet = new Set(prev);
        renewableInView.forEach((r) => newSet.add(r.label));
        return newSet;
      });
    }
  }, [processedRecords, selectedLabels, clearSelection]);

  return {
    processedRecords,
    sortConfig,
    filterConfig,
    handleSort,
    setFilterConfig,
    selectedLabels,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    statusCounts,
    actionCounts,
    nameCounts,
    isViewStateDirty,
    resetViewState,
    levelCounts,
  };
};
