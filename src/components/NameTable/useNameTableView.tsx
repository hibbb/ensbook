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
import { useOwnerStats } from "./hooks/useOwnerStats";
import { useTableStats } from "./hooks/useTableStats";

export const DEFAULT_SORT: SortConfig = { field: "status", direction: null };
export const DEFAULT_FILTER: FilterConfig = {
  statusList: [],
  memoFilter: "all",
  actionType: "all",
  lengthList: [],
  wrappedType: "all",
  levelList: [],
  ownerList: [],
};

export const useNameTableView = (
  records: NameRecord[] | undefined,
  currentAddress?: string,
  context?: "home" | "collection",
  collectionId?: string,
) => {
  // 1. 状态管理与持久化 (保持不变)
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

  const isInternalWrite = useRef(false);

  useEffect(() => {
    if (!context) return;
    const viewState: PageViewState = { sort: sortConfig, filter: filterConfig };
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
      setTimeout(() => {
        isInternalWrite.current = false;
      }, 0);
    }
  }, [sortConfig, filterConfig, context, collectionId]);

  useEffect(() => {
    const handleExternalUpdate = () => {
      if (isInternalWrite.current) return;
      const saved = getSavedState();
      const isStorageReset = !saved.filter && !saved.sort;
      if (isStorageReset) {
        setSortConfig(DEFAULT_SORT);
        setFilterConfig(DEFAULT_FILTER);
      }
    };

    window.addEventListener("user-settings-updated", handleExternalUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key && e.key.includes("ensbook_user_data")) {
        handleExternalUpdate();
      }
    });

    return () => {
      window.removeEventListener("user-settings-updated", handleExternalUpdate);
      window.removeEventListener("storage", handleExternalUpdate);
    };
  }, [getSavedState]);

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
      filterConfig.memoFilter !== DEFAULT_FILTER.memoFilter ||
      filterConfig.actionType !== DEFAULT_FILTER.actionType ||
      filterConfig.wrappedType !== DEFAULT_FILTER.wrappedType ||
      (filterConfig.statusList?.length || 0) > 0 ||
      (filterConfig.lengthList?.length || 0) > 0 ||
      (filterConfig.levelList?.length || 0) > 0 ||
      (filterConfig.ownerList?.length || 0) > 0;

    return isSortDirty || isFilterDirty;
  }, [sortConfig, filterConfig]);

  const resetViewState = useCallback(() => {
    setSortConfig(DEFAULT_SORT);
    setFilterConfig(DEFAULT_FILTER);
  }, []);

  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());
  const baseRecords = useMemo(() => records || [], [records]);

  // 2. 定义通用的 passOthers 逻辑 (供子 Hook 使用)
  const passOthers = useCallback(
    (r: NameRecord, exclude: string[]) => {
      const {
        statusList,
        actionType,
        lengthList,
        wrappedType,
        memoFilter,
        levelList,
        ownerList,
      } = filterConfig;

      if (
        !exclude.includes("status") &&
        statusList.length > 0 &&
        !statusList.includes(r.status)
      )
        return false;

      if (!exclude.includes("action")) {
        if (actionType === "renew" && !isRenewable(r.status)) return false;
        if (actionType === "register" && !isRegistrable(r.status)) return false;
      }

      if (
        !exclude.includes("length") &&
        lengthList.length > 0 &&
        !lengthList.includes(r.label.length)
      )
        return false;

      if (!exclude.includes("wrapped")) {
        if (wrappedType === "wrapped" && !r.wrapped) return false;
        if (wrappedType === "unwrapped" && r.wrapped) return false;
      }

      if (!exclude.includes("memo")) {
        const hasMemo = !!r.memo && r.memo.trim().length > 0;
        if (memoFilter === "with_memo" && !hasMemo) return false;
        if (memoFilter === "no_memo" && hasMemo) return false;
      }

      if (
        !exclude.includes("level") &&
        levelList.length > 0 &&
        !levelList.includes(r.level || 0)
      )
        return false;

      if (!exclude.includes("owner") && ownerList.length > 0) {
        if (!r.owner || !ownerList.includes(r.owner.toLowerCase()))
          return false;
      }

      return true;
    },
    [filterConfig],
  );

  // 3. 调用子 Hooks 获取统计数据
  const { statusCounts, actionCounts, nameCounts, levelCounts } = useTableStats(
    {
      baseRecords,
      passOthers,
    },
  );

  const { ownerCounts, ownerStats, ownershipCounts } = useOwnerStats({
    baseRecords,
    currentAddress,
    passOthers,
  });

  // 4. 数据处理与操作 (保持不变)
  const processedRecords = useMemo(
    () => processNameRecords(baseRecords, sortConfig, filterConfig),
    [baseRecords, sortConfig, filterConfig],
  );

  const handleSort = useCallback((field: SortField) => {
    setSortConfig((prev) => {
      const isDescFirst = field === "registered";
      if (prev.field !== field) {
        return { field, direction: isDescFirst ? "desc" : "asc" };
      }
      if (prev.direction === null) {
        return { field, direction: isDescFirst ? "desc" : "asc" };
      }
      if (isDescFirst) {
        if (prev.direction === "desc") return { field, direction: "asc" };
        if (prev.direction === "asc") return { field, direction: null };
      } else {
        if (prev.direction === "asc") return { field, direction: "desc" };
        if (prev.direction === "desc") return { field, direction: null };
      }
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
    ownerCounts,
    ownerStats,
    ownershipCounts,
  };
};
