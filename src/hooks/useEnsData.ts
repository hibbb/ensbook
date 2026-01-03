// src/hooks/useEnsData.ts
import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { fetchNameRecords } from "../services/graph/fetchNameRecords";
import { fetchLabels } from "../services/graph/fetchLabels";
import type { ClassifiedInputs } from "../utils/parseInputs";
import { ENS_COLLECTIONS } from "../config/collections";

export function useNameRecords(labels: string[]) {
  return useQuery({
    queryKey: ["name-records", labels],
    queryFn: () => fetchNameRecords(labels),
    enabled: labels.length > 0,
    staleTime: 1000 * 30, // 数据新鲜度 30秒

    // 🚀 性能优化：智能占位检测 (Smart Placeholder)
    placeholderData: (previousData, previousQuery) => {
      if (!previousData) return undefined;

      const previousLabels = previousQuery?.queryKey[1] as string[] | undefined;
      if (!previousLabels || !Array.isArray(previousLabels)) return undefined;

      const newLabelSet = new Set(labels);
      const prevLabelSet = new Set(previousLabels);

      // 1. 追加判定：旧列表的所有元素都在新列表中 (e.g. [A] -> [A, B])
      const isAppending = previousLabels.every((label) =>
        newLabelSet.has(label),
      );

      // 2. 删除判定：新列表的所有元素都在旧列表中 (e.g. [A, B] -> [A])
      // 🚀 新增逻辑：处理删除操作不显示骨架屏
      const isDeleting = labels.every((label) => prevLabelSet.has(label));

      // 只要是增量或减量操作，都保留旧数据，避免闪烁
      return isAppending || isDeleting ? previousData : undefined;
    },
  });
}

/**
 * Hook 2: 获取特定集合的域名详情
 * 用于 999 俱乐部或助记词集合页面
 */
export function useCollectionRecords(collectionId: string) {
  const collection = ENS_COLLECTIONS[collectionId];
  const labels = collection?.labels || [];

  return useQuery({
    queryKey: ["collection-records", collectionId, labels.length],
    queryFn: () => fetchNameRecords(labels),
    enabled: !!collection && labels.length > 0,
    staleTime: 1000 * 60 * 5, // 集合数据相对稳定，缓存 5 分钟
    // 注意：如果您希望切换集合时显示骨架屏，请确保移除了 keepPreviousData
    // 如果保留 keepPreviousData，切换时会显示上一个集合的数据
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook 3: 反查/解析域名 (Fetch Labels)
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
