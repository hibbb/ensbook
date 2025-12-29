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
    direction: "asc",
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    statusList: [],
    onlyMe: false,
    actionType: "all",
  });

  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  // --- 1. 过滤逻辑 ---
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
  const processedRecords = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.field) {
      return filteredRecords;
    }

    const sorted = [...filteredRecords];
    const { field, direction } = sortConfig;

    // 🚀 修复：定义明确的返回值类型，避免使用 any
    const getValue = (item: NameRecord): string | number | undefined | null => {
      if (field === "length") return item.label.length;
      if (field === "status") return item.expiryTime;

      // 使用类型收窄确保 field 是 NameRecord 的有效键
      const key = field as keyof NameRecord;
      const value = item[key];

      // 仅允许 string 或 number 参与排序比较
      return typeof value === "string" || typeof value === "number"
        ? value
        : null;
    };

    sorted.sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);

      // 🚀 修复：为比较参数定义明确的联合类型
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

  // --- Handlers ---
  const handleSort = useCallback((field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field !== field) return { field, direction: "asc" };
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
