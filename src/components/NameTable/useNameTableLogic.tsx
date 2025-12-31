// src/components/NameTable/useNameTableLogic.ts

import { useState, useMemo, useCallback } from "react";
import type { NameRecord } from "../../types/ensNames";
import { isRenewable } from "../../utils/ens";
import type { SortField, SortConfig, FilterConfig } from "./types";

type SortableValue = string | number | null | undefined;

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
    actionType: "all",
    // 🚀 初始化新筛选状态
    lengthList: [],
    wrappedType: "all",
  });

  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  // 解构所有配置项
  const { statusList, actionType, onlyMe, lengthList, wrappedType } =
    filterConfig;

  // --- 1. 基础过滤 (Base Filter) ---
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

  // --- 2. 统计计数 (Counts Calculation) ---
  // 使用 "Cross-Filtering" 逻辑：计算某一项的计数时，应基于"除了该项以外的其他所有筛选条件"过滤后的结果
  const { statusCounts, actionCounts, nameCounts } = useMemo(() => {
    // 辅助：通用过滤检查器
    const checkStatus = (r: NameRecord) =>
      statusList.length === 0 || statusList.includes(r.status);
    const checkAction = (r: NameRecord) => {
      if (actionType === "all") return true;
      const renewable = isRenewable(r.status);
      return actionType === "renew" ? renewable : !renewable;
    };
    const checkLength = (r: NameRecord) =>
      lengthList.length === 0 || lengthList.includes(r.label.length);
    const checkWrapped = (r: NameRecord) => {
      if (wrappedType === "all") return true;
      return wrappedType === "wrapped" ? r.wrapped : !r.wrapped;
    };

    // 2.1 计算状态计数 (受 Action, Length, Wrapped 影响)
    const statusCounts: Record<string, number> = {};
    baseRecords
      .filter((r) => checkAction(r) && checkLength(r) && checkWrapped(r))
      .forEach(
        (r) => (statusCounts[r.status] = (statusCounts[r.status] || 0) + 1),
      );

    // 2.2 计算操作计数 (受 Status, Length, Wrapped 影响)
    const recordsForAction = baseRecords.filter(
      (r) => checkStatus(r) && checkLength(r) && checkWrapped(r),
    );
    const actionCounts = {
      all: recordsForAction.length,
      register: recordsForAction.filter((r) => !isRenewable(r.status)).length,
      renew: recordsForAction.filter((r) => isRenewable(r.status)).length,
    };

    // 🚀 2.3 计算名称相关计数 (Length & Wrapped)
    // Length 计数 (受 Status, Action, Wrapped 影响)
    const lengthCounts: Record<number, number> = {};
    const availableLengths = new Set<number>(); // 记录所有存在的长度
    baseRecords.forEach((r) => availableLengths.add(r.label.length)); // 先收集所有可能长度

    // 填充计数
    baseRecords
      .filter((r) => checkStatus(r) && checkAction(r) && checkWrapped(r))
      .forEach(
        (r) =>
          (lengthCounts[r.label.length] =
            (lengthCounts[r.label.length] || 0) + 1),
      );

    // Wrapped 计数 (受 Status, Action, Length 影响)
    const recordsForWrapped = baseRecords.filter(
      (r) => checkStatus(r) && checkAction(r) && checkLength(r),
    );
    const wrappedCounts = {
      all: recordsForWrapped.length,
      wrapped: recordsForWrapped.filter((r) => r.wrapped).length,
      unwrapped: recordsForWrapped.filter((r) => !r.wrapped).length,
    };

    return {
      statusCounts,
      actionCounts,
      nameCounts: {
        lengthCounts,
        availableLengths: Array.from(availableLengths).sort((a, b) => a - b),
        wrappedCounts,
      },
    };
  }, [baseRecords, statusList, actionType, lengthList, wrappedType]);

  // --- 3. 最终表格数据过滤 ---
  const filteredRecords = useMemo(() => {
    return baseRecords.filter((record) => {
      // 状态
      if (statusList.length > 0 && !statusList.includes(record.status))
        return false;
      // 操作类型
      if (actionType !== "all") {
        const renewable = isRenewable(record.status);
        if (actionType === "renew" && !renewable) return false;
        if (actionType === "register" && renewable) return false;
      }
      // 🚀 长度
      if (lengthList.length > 0 && !lengthList.includes(record.label.length))
        return false;
      // 🚀 包装状态
      if (wrappedType !== "all") {
        if (wrappedType === "wrapped" && !record.wrapped) return false;
        if (wrappedType === "unwrapped" && record.wrapped) return false;
      }
      return true;
    });
  }, [baseRecords, statusList, actionType, lengthList, wrappedType]);

  // --- 4. 排序逻辑 (保持不变) ---
  const processedRecords = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.field) return filteredRecords;
    const sorted = [...filteredRecords];
    const { field, direction } = sortConfig;

    const getValue = (item: NameRecord): SortableValue => {
      if (field === "length") return item.label.length;
      if (field === "status") return item.expiryTime;
      const key = field as keyof NameRecord;
      const value = item[key];
      return typeof value === "string" || typeof value === "number"
        ? value
        : null;
    };

    sorted.sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);
      const compare = (valA: SortableValue, valB: SortableValue) => {
        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        return valA < valB ? -1 : 1;
      };
      const diff = compare(aValue, bValue);
      return direction === "asc" ? diff : -diff;
    });
    return sorted;
  }, [filteredRecords, sortConfig]);

  // ... Handlers (保持不变) ...
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
    nameCounts, // 🚀 导出新计数
  };
};
