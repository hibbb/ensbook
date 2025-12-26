// src/hooks/useEnsData.ts
import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { fetchNameRecords } from "../services/graph/fetchNameRecords"; // 确认路径
import { fetchLabels } from "../services/graph/fetchLabels";
import type { ClassifiedInputs } from "../utils/parseInputs";
import { ENS_COLLECTIONS } from "../config/collections";

export function useNameRecords(labels: string[]) {
  return useQuery({
    queryKey: ["name-records", labels],
    queryFn: () => fetchNameRecords(labels),
    enabled: labels.length > 0,
    staleTime: 1000 * 30, // 数据新鲜度 30秒

    // 🚀 性能优化：O(N) 复杂度的智能占位检测
    placeholderData: (previousData, previousQuery) => {
      if (!previousData) return undefined;

      const previousLabels = previousQuery?.queryKey[1] as string[] | undefined;
      if (!previousLabels || !Array.isArray(previousLabels)) return undefined;

      // 优化点：使用 Set 进行 O(1) 查找
      // 逻辑：如果 【新列表】 包含了 【旧列表】 的所有元素，则视为追加
      const newLabelSet = new Set(labels);
      const isAppending = previousLabels.every((label) =>
        newLabelSet.has(label),
      );

      return isAppending ? previousData : undefined;
    },
  });
}

/**
 * Hook 2: 获取特定集合的域名详情 (新增加)
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
