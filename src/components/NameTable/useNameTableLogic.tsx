// src/components/NameTable/useNameTableLogic.ts

import { useState, useMemo, useCallback } from "react";
import type { NameRecord } from "../../types/ensNames";
import { isRenewable } from "../../utils/ens";
import type { SortField, SortConfig, FilterConfig } from "./types";

export const useNameTableLogic = (
  records: NameRecord[] | undefined,
  currentAddress?: string,
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "status", // 默认排序字段
    direction: "asc",
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    statusList: [],
    onlyMe: false,
    actionType: "all",
  });

  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  // --- 1. 过滤逻辑 (Filtering) ---
  const filteredRecords = useMemo(() => {
    if (!records) return [];

    // 预先处理 filterConfig 以避免在循环中重复检查
    const { statusList, onlyMe, actionType } = filterConfig;
    const hasStatusFilter = statusList.length > 0;
    const lowerCurrentAddress = currentAddress?.toLowerCase();

    return records.filter((record) => {
      // 1. 状态筛选
      if (hasStatusFilter && !statusList.includes(record.status)) {
        return false;
      }

      // 2. "只看我的"筛选
      if (onlyMe && lowerCurrentAddress) {
        if (record.owner?.toLowerCase() !== lowerCurrentAddress) {
          return false;
        }
      }

      // 3. 操作类型筛选
      if (actionType !== "all") {
        const renewable = isRenewable(record.status);
        if (actionType === "renew" && !renewable) return false;
        if (actionType === "register" && renewable) return false;
      }

      return true;
    });
  }, [records, filterConfig, currentAddress]);

  // --- 2. 排序逻辑 (Sorting) ---
  const processedRecords = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.field) {
      return filteredRecords;
    }

    const sorted = [...filteredRecords];
    const { field, direction } = sortConfig;

    // 辅助函数：安全获取用于排序的值
    const getValue = (item: NameRecord) => {
      if (field === "length") return item.label.length;
      // 此时 field 是 NameRecord 的键
      return item[field as keyof NameRecord];
    };

    sorted.sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);

      // 统一处理 Null/Undefined (始终排在最后)
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // 标准比较
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredRecords, sortConfig]);

  // --- Handlers ---

  const handleSort = useCallback((field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const toggleSelection = useCallback((label: string) => {
    setSelectedLabels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLabels(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    // 仅针对当前视图中“可续费”的记录进行全选操作
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
  };
};
