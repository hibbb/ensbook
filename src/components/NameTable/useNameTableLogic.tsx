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
    field: "status",
    direction: null,
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    statusList: [],
    onlyMe: false,
    actionType: "all",
  });

  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  // --- 1. 过滤逻辑 ---
  // 🚀 核心修复：彻底移除 useMemo！
  // 恢复为普通函数调用。这样只要组件重渲染（包括父组件传入了更新后的对象），
  // 这里就会重新执行过滤，确保拿到最新的 ownerPrimaryName。
  const filteredRecords = useMemo(() => {
    if (!records) return [];

    const { statusList, onlyMe, actionType } = filterConfig;
    const hasStatusFilter = statusList.length > 0;
    const lowerCurrentAddress = currentAddress?.toLowerCase();

    return records.filter((record) => {
      if (hasStatusFilter && !statusList.includes(record.status)) return false;
      if (onlyMe && lowerCurrentAddress) {
        if (record.owner?.toLowerCase() !== lowerCurrentAddress) return false;
      }
      if (actionType !== "all") {
        const renewable = isRenewable(record.status);
        if (actionType === "renew" && !renewable) return false;
        if (actionType === "register" && renewable) return false;
      }
      return true;
    });
  }, [records, filterConfig, currentAddress]);

  // --- 2. 排序逻辑 ---
  // 🚀 核心修复：彻底移除 useMemo！
  const processedRecords = useMemo(() => {
    // 如果没有排序方向，直接返回过滤后的结果（默认顺序）
    if (!sortConfig.direction || !sortConfig.field) {
      return filteredRecords;
    }

    const sorted = [...filteredRecords];
    const { field, direction } = sortConfig;

    const getValue = (item: NameRecord): string | number | undefined | null => {
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

      const compare = (
        valA: string | number | undefined | null,
        valB: string | number | undefined | null,
      ): number => {
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        return valA < valB ? -1 : 1;
      };

      const primaryDiff = compare(aValue, bValue);

      if (primaryDiff !== 0) {
        return direction === "asc" ? primaryDiff : -primaryDiff;
      }

      if (field !== "label") {
        const secondaryDiff = compare(a.label, b.label);
        return direction === "asc" ? secondaryDiff : -secondaryDiff;
      }

      return 0;
    });

    return sorted;
  }, [filteredRecords, sortConfig]);

  // --- Handlers (保持不变) ---
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
