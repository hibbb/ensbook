// src/components/NameTable/useNameTableView.tsx

import { useState, useMemo, useCallback, useEffect } from "react";
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

  useEffect(() => {
    if (!context) return;
    const viewState: PageViewState = { sort: sortConfig, filter: filterConfig };
    try {
      if (context === "home") {
        saveHomeViewState(viewState);
      } else if (context === "collection" && collectionId) {
        saveCollectionViewState(collectionId, viewState);
      }
    } catch (e) {
      console.warn("Failed to save view state:", e);
    }
  }, [sortConfig, filterConfig, context, collectionId]);

  // 🚀 核心修复：更新脏检查逻辑
  const isViewStateDirty = useMemo(() => {
    // 1. 排序脏检查 (优化版)
    // 如果当前没有排序方向 (direction === null)，无论 field 是什么，都视为"未修改"
    const isSortDirty = (() => {
      if (sortConfig.direction === null && DEFAULT_SORT.direction === null) {
        return false;
      }
      return (
        sortConfig.field !== DEFAULT_SORT.field ||
        sortConfig.direction !== DEFAULT_SORT.direction
      );
    })();

    // 2. 筛选脏检查
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

      // 🟢 修正代码：
      const recordsWithMemos = baseRecords.filter(
        (r) =>
          // 1. 符合其他所有筛选条件
          passOthers(r, ["memo"]) &&
          // 2. 并且确实拥有备注
          !!r.memo &&
          r.memo.trim().length > 0,
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
