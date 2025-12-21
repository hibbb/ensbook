import { useState, useMemo } from "react";
import { processNameRecords } from "./utils";
import type { NameRecord } from "../../types/ensNames";
import type { SortField, SortConfig, FilterConfig } from "./types";

export const useNameTableLogic = (
  records: NameRecord[] | undefined,
  currentAddress?: string,
) => {
  // 统一管理表格状态
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: null,
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    onlyMe: false,
    statusList: [],
    actionType: "all",
  });

  // 处理排序点击
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

  // 使用计算函数
  const processedRecords = useMemo(
    () => processNameRecords(records, sortConfig, filterConfig, currentAddress),
    [records, sortConfig, filterConfig, currentAddress],
  );

  return {
    processedRecords,
    sortConfig,
    filterConfig,
    handleSort,
    setFilterConfig,
  };
};
