// src/hooks/useOptimisticLevelUpdate.ts

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateDomainMeta } from "../services/storage/userStore";
import type { NameRecord } from "../types/ensNames";

export const useOptimisticLevelUpdate = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (record: NameRecord, newLevel: number) => {
      // 1. 写入本地存储 (Global Metadata)
      updateDomainMeta(record.label, { level: newLevel });

      // 2. 定义通用的更新函数 (纯内存操作)
      const updateList = (oldData: NameRecord[] | undefined) => {
        if (!oldData) return [];
        return oldData.map((r) =>
          r.label.toLowerCase() === record.label.toLowerCase()
            ? { ...r, level: newLevel }
            : r,
        );
      };

      // 3. 模糊匹配并更新所有相关的缓存 (Home, Mine, Collections)
      queryClient.setQueriesData<NameRecord[]>(
        { queryKey: ["name-records"] },
        updateList,
      );
      queryClient.setQueriesData<NameRecord[]>(
        { queryKey: ["collection-records"] },
        updateList,
      );
    },
    [queryClient],
  );
};
