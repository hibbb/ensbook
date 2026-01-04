// src/components/NameTable/useNameTableLogic.tsx

import { useState, useMemo, useCallback } from "react";
import type { NameRecord } from "../../types/ensNames";
// 🚀 引入 isRegistrable
import { isRenewable, isRegistrable } from "../../utils/ens";
import type { SortField, SortConfig, FilterConfig } from "./types";
import { processNameRecords } from "./utils";

export const useNameTableLogic = (
  records: NameRecord[] | undefined,
  currentAddress?: string,
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "status",
    direction: null,
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    statusList: [],
    onlyMe: false,
    onlyWithMemos: false,
    actionType: "all",
    lengthList: [],
    wrappedType: "all",
  });

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

    // 🚀 优化：使用精确的操作判断
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

    // 🚀 2.2 操作计数 (精确统计)
    const recordsForAction = baseRecords.filter(
      (r) =>
        checkStatus(r) && checkLength(r) && checkWrapped(r) && checkMemos(r),
    );
    const actionCounts = {
      all: recordsForAction.length,
      // 以前是 !isRenewable，现在改为显式 isRegistrable
      // 这样 Unknown 状态就不会被算进去了
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

  // ... (其余部分保持不变)
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
