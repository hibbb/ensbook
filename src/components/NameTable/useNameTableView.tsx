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

const DEFAULT_SORT: SortConfig = { field: "status", direction: null };
const DEFAULT_FILTER: FilterConfig = {
  statusList: [],
  onlyMe: false,
  onlyWithMemos: false, // 注意：确保这里使用的是 onlyWithMemos 而不是 onlyWithNotes，根据您的 types 定义
  actionType: "all",
  lengthList: [],
  wrappedType: "all",
};

export const useNameTableView = (
  records: NameRecord[] | undefined,
  currentAddress?: string,
  context?: "home" | "collection",
  collectionId?: string,
) => {
  // 辅助函数：同步读取已保存的状态
  const getSavedState = useCallback((): PageViewState => {
    if (context === "home") return getHomeViewState();
    if (context === "collection" && collectionId)
      return getCollectionViewState(collectionId);
    return {};
  }, [context, collectionId]);

  // 1. 初始化状态 (Lazy Init)
  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const saved = getSavedState();
    return saved.sort || DEFAULT_SORT;
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>(() => {
    const saved = getSavedState();
    return saved.filter || DEFAULT_FILTER;
  });

  // 🚀 2. 导航切换处理 (Render-Phase Update)
  // 修复 "Cannot access refs during render" 错误
  // 使用 useState 替代 useRef。React 允许在渲染期间更新组件本身的状态（setPrevKey），
  // 这会触发立即重新渲染（Immediate Re-render），从而在浏览器绘制前更新状态。
  const currentKey = `${context}-${collectionId}`;
  const [prevKey, setPrevKey] = useState(currentKey);

  if (prevKey !== currentKey) {
    const saved = getSavedState();
    setSortConfig(saved.sort || DEFAULT_SORT);
    setFilterConfig(saved.filter || DEFAULT_FILTER);
    setPrevKey(currentKey);
  }

  // 3. 自动保存 (Side Effect)
  useEffect(() => {
    if (!context) return;
    const viewState: PageViewState = { sort: sortConfig, filter: filterConfig };

    // 🛡️ P2原则修正：增加 try-catch 防止存储满时崩溃
    try {
      if (context === "home") {
        saveHomeViewState(viewState);
      } else if (context === "collection" && collectionId) {
        saveCollectionViewState(collectionId, viewState);
      }
    } catch (e) {
      // 存储失败通常是因为空间满，视图状态保存失败不应阻断用户操作
      // 可以选择 console.warn 或者忽略
      console.warn("Failed to save view state:", e);
    }
  }, [sortConfig, filterConfig, context, collectionId]);

  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  const { statusList, actionType, onlyMe, lengthList, wrappedType } =
    filterConfig;

  // --- 1. 基础过滤 ---
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

  // --- 2. 统计计数 ---
  const { statusCounts, actionCounts, nameCounts } = useMemo(() => {
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

    // 2.1 状态计数
    const statusCounts: Record<string, number> = {};
    baseRecords
      .filter(
        (r) =>
          checkAction(r) && checkLength(r) && checkWrapped(r) && checkMemos(r),
      )
      .forEach(
        (r) => (statusCounts[r.status] = (statusCounts[r.status] || 0) + 1),
      );

    // 2.2 操作计数
    const recordsForAction = baseRecords.filter(
      (r) =>
        checkStatus(r) && checkLength(r) && checkWrapped(r) && checkMemos(r),
    );
    const actionCounts = {
      all: recordsForAction.length,
      register: recordsForAction.filter((r) => isRegistrable(r.status)).length,
      renew: recordsForAction.filter((r) => isRenewable(r.status)).length,
    };

    // 2.3 名称相关计数
    const lengthCounts: Record<number, number> = {};
    const availableLengths = new Set<number>();
    baseRecords.forEach((r) => availableLengths.add(r.label.length));

    baseRecords
      .filter(
        (r) =>
          checkStatus(r) && checkAction(r) && checkWrapped(r) && checkMemos(r),
      )
      .forEach(
        (r) =>
          (lengthCounts[r.label.length] =
            (lengthCounts[r.label.length] || 0) + 1),
      );

    const recordsForWrapped = baseRecords.filter(
      (r) =>
        checkStatus(r) && checkAction(r) && checkLength(r) && checkMemos(r),
    );
    const wrappedCounts = {
      all: recordsForWrapped.length,
      wrapped: recordsForWrapped.filter((r) => r.wrapped).length,
      unwrapped: recordsForWrapped.filter((r) => !r.wrapped).length,
    };

    const recordsWithMemos = baseRecords.filter(
      (r) =>
        checkStatus(r) &&
        checkAction(r) &&
        checkLength(r) &&
        checkWrapped(r) &&
        !!r.memo &&
        r.memo.trim().length > 0,
    );
    const memosCount = recordsWithMemos.length;

    return {
      statusCounts,
      actionCounts,
      nameCounts: {
        lengthCounts,
        availableLengths: Array.from(availableLengths).sort((a, b) => a - b),
        wrappedCounts,
        memosCount,
      },
    };
  }, [
    baseRecords,
    statusList,
    actionType,
    lengthList,
    wrappedType,
    filterConfig.onlyWithMemos,
  ]);

  // 处理排序和筛选
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
  };
};
