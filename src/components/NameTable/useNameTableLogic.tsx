import { useState, useMemo } from "react";
import { processNameRecords } from "./utils";
import type { NameRecord } from "../../types/ensNames";
import type { SortField, SortConfig, FilterConfig } from "./types";

export const useNameTableLogic = (
  records: NameRecord[] | undefined | null, // 允许输入 undefined
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
    // 🚀 核心修复：如果数据还没准备好，严格返回 undefined
    // 不要让它变成空数组，否则 UI 会误以为是“没有数据的空列表”
    if (!records) return undefined;

    return processNameRecords(
      records,
      sortConfig,
      filterConfig,
      currentAddress,
    );
  }, [records, sortConfig, filterConfig, currentAddress]);

  return {
    processedRecords,
    sortConfig,
    filterConfig,
    handleSort,
    setFilterConfig,
  };
};
