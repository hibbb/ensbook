// src/components/NameTable/useNameTableLogic.ts

import { useState, useMemo, useCallback } from "react";
import type { NameRecord } from "../../types/ensNames";
import { isRenewable } from "../../utils/ens";
import type { SortField, SortConfig, FilterConfig } from "./types";

// 1. 定义排序值的联合类型
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
  });

  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  // 🚀 核心修复：在 useMemo 外部解构，确保依赖项精确且无 lint 警告
  const { statusList, actionType, onlyMe } = filterConfig;

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
  const { statusCounts, actionCounts } = useMemo(() => {
    // 2.1 计算状态计数
    const statusCounts: Record<string, number> = {};
    const recordsForStatus = baseRecords.filter((r) => {
      if (actionType === "all") return true;
      const renewable = isRenewable(r.status);
      return actionType === "renew" ? renewable : !renewable;
    });
    recordsForStatus.forEach((r) => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    // 2.2 计算操作计数
    const recordsForAction = baseRecords.filter((r) => {
      if (statusList.length === 0) return true;
      return statusList.includes(r.status);
    });
    const registerCount = recordsForAction.filter(
      (r) => !isRenewable(r.status),
    ).length;
    const renewCount = recordsForAction.filter((r) =>
      isRenewable(r.status),
    ).length;

    const counts = {
      all: recordsForAction.length,
      register: registerCount,
      renew: renewCount,
    };

    return { statusCounts, actionCounts: counts };
  }, [baseRecords, statusList, actionType]);

  // --- 3. 最终表格数据过滤 ---
  const filteredRecords = useMemo(() => {
    return baseRecords.filter((record) => {
      // 状态过滤
      if (statusList.length > 0 && !statusList.includes(record.status)) {
        return false;
      }
      // 操作类型过滤
      if (actionType !== "all") {
        const renewable = isRenewable(record.status);
        if (actionType === "renew" && !renewable) return false;
        if (actionType === "register" && renewable) return false;
      }
      return true;
    });
  }, [baseRecords, statusList, actionType]);

  // --- 4. 排序逻辑 ---
  const processedRecords = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.field) {
      return filteredRecords;
    }

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

  // ... Handlers ...
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
  };
};
