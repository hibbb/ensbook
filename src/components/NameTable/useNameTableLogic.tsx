import { useState, useMemo, useCallback } from "react";
import { processNameRecords } from "./utils";
import type { NameRecord } from "../../types/ensNames";
import type { SortField, SortConfig, FilterConfig } from "./types";

export const useNameTableLogic = (
  records: NameRecord[] | undefined | null,
  currentAddress?: string,
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: null,
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    onlyMe: false,
    statusList: [],
    actionType: "all",
  });

  // 🚀 新增：多选状态 (存储 label，例如 "vitalik")
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc"
          ? "desc"
          : prev.field === field && prev.direction === "desc"
            ? null
            : "asc",
    }));
  };

  const processedRecords = useMemo(() => {
    if (!records) return undefined;
    return processNameRecords(
      records,
      sortConfig,
      filterConfig,
      currentAddress,
    );
  }, [records, sortConfig, filterConfig, currentAddress]);

  // 🚀 新增：单选切换逻辑
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

  // 🚀 新增：全选/取消全选逻辑
  // 只选择当前筛选结果中显示的记录
  const toggleSelectAll = useCallback(() => {
    if (!processedRecords || processedRecords.length === 0) return;

    setSelectedLabels((prev) => {
      // 检查当前显示的记录是否都已选中
      const allSelected = processedRecords.every((r) => prev.has(r.label));

      if (allSelected) {
        // 如果都选中了，则清除当前页面的选中项（保留其他筛选状态下的选中项可能更复杂，这里简单处理为清空当前显示的）
        // 为了用户体验直观，这里我们做“清空当前显示的选中项”
        const newSet = new Set(prev);
        processedRecords.forEach((r) => newSet.delete(r.label));
        return newSet;
      } else {
        // 否则，将当前显示的所有记录添加到选中项
        const newSet = new Set(prev);
        processedRecords.forEach((r) => newSet.add(r.label));
        return newSet;
      }
    });
  }, [processedRecords]);

  // 🚀 新增：清空所有选中
  const clearSelection = useCallback(() => {
    setSelectedLabels(new Set());
  }, []);

  return {
    processedRecords,
    sortConfig,
    filterConfig,
    handleSort,
    setFilterConfig,
    // 导出多选相关
    selectedLabels,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
  };
};
