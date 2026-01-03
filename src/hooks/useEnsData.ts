// src/hooks/useEnsData.ts

import { useQuery } from "@tanstack/react-query";
import { fetchNameRecords } from "../services/graph/fetchNameRecords";
import { fetchLabels } from "../services/graph/fetchLabels";
import type { ClassifiedInputs } from "../utils/parseInputs";
import { ENS_COLLECTIONS } from "../config/collections";

/**
 * Hook 1: 获取通用域名列表 (Home 页)
 * 场景：用户手动输入、添加、删除、批量操作
 * 需求：列表增减时保持 UI 稳定（不闪烁），但完全重置（如清空）时显示骨架屏
 */
export function useNameRecords(labels: string[]) {
  return useQuery({
    queryKey: ["name-records", labels],
    queryFn: () => fetchNameRecords(labels),
    enabled: labels.length > 0,
    staleTime: 1000 * 30, // 30秒

    // 🚀 智能占位逻辑：仅在"增量"或"减量"更新时保留旧数据
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
      const isDeleting = labels.every((label) => prevLabelSet.has(label));

      // 只要是增量或减量操作，都保留旧数据，避免闪烁
      // 如果是完全无关的列表切换，则返回 undefined (显示骨架屏)
      return isAppending || isDeleting ? previousData : undefined;
    },
  });
}

/**
 * Hook 2: 获取特定集合的域名详情 (集合页)
 * 场景：侧边栏导航切换
 * 需求：切换集合时，必须立即显示骨架屏，给用户加载反馈
 */
export function useCollectionRecords(collectionId: string) {
  const collection = ENS_COLLECTIONS[collectionId];
  const labels = collection?.labels || [];

  return useQuery({
    queryKey: ["collection-records", collectionId, labels.length],
    queryFn: () => fetchNameRecords(labels),
    enabled: !!collection && labels.length > 0,
    staleTime: 1000 * 60 * 5, // 5分钟

    // ❌ 关键修复：移除 placeholderData
    // 切换集合是"导航"行为，我们需要 isLoading 立即变回 true 以展示骨架屏。
    // 如果加了 keepPreviousData，用户会看到上一个集合的数据，直到新集合加载完突然跳变。
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
