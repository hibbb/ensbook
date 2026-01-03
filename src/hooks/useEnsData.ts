// src/hooks/useEnsData.ts

import { useQuery } from "@tanstack/react-query";
// ❌ 删除 keepPreviousData 的引用，不再需要它
// import { keepPreviousData } from "@tanstack/react-query";
import { fetchNameRecords } from "../services/graph/fetchNameRecords";
import { fetchLabels } from "../services/graph/fetchLabels";
import type { ClassifiedInputs } from "../utils/parseInputs";
import { ENS_COLLECTIONS } from "../config/collections";

export function useNameRecords(labels: string[]) {
  return useQuery({
    queryKey: ["name-records", labels],
    queryFn: () => fetchNameRecords(labels),
    enabled: labels.length > 0,
    staleTime: 1000 * 30,

    // ✅ 保留这里的智能占位逻辑，它保证了“手动添加域名”时不会闪烁
    placeholderData: (previousData, previousQuery) => {
      if (!previousData) return undefined;

      const previousLabels = previousQuery?.queryKey[1] as string[] | undefined;
      if (!previousLabels || !Array.isArray(previousLabels)) return undefined;

      const newLabelSet = new Set(labels);
      const isAppending = previousLabels.every((label) =>
        newLabelSet.has(label),
      );

      return isAppending ? previousData : undefined;
    },
  });
}

/**
 * Hook 2: 获取特定集合的域名详情
 */
export function useCollectionRecords(collectionId: string) {
  const collection = ENS_COLLECTIONS[collectionId];
  const labels = collection?.labels || [];

  return useQuery({
    queryKey: ["collection-records", collectionId, labels.length],
    queryFn: () => fetchNameRecords(labels),
    enabled: !!collection && labels.length > 0,
    staleTime: 1000 * 60 * 5,
    // 🚀 核心修复：移除 keepPreviousData
    // 这样当 collectionId 变化时，data 会立即变为 undefined，isLoading 变为 true
    // 从而自然触发页面级的骨架屏
  });
}

/**
 * Hook 3: 反查/解析域名
 */
export function useEnsLabels(classifiedInputs: ClassifiedInputs) {
  const hasInputs =
    classifiedInputs.sameOwners.length > 0 ||
    classifiedInputs.linkOwners.length > 0 ||
    classifiedInputs.pureLabels.length > 0;

  return useQuery({
    queryKey: ["ens-labels", classifiedInputs],
    queryFn: () => fetchLabels(classifiedInputs),
    enabled: hasInputs,
    staleTime: 1000 * 60 * 5,
  });
}
