// src/hooks/useEnsData.ts

import { useQuery } from "@tanstack/react-query";
import { fetchNameRecordsGraph } from "../services/graph/fetchNameRecords";
import { fetchNameRecordsRPC } from "../services/rpc/fetchNameRecords";
import { fetchLabels } from "../services/graph/fetchLabels";
import type { ClassifiedInputs } from "../utils/parseInputs";
import { ENS_COLLECTIONS } from "../config/collections";

/**
 * Hook 1: 获取通用域名列表 (Home 页)
 * 🚀 升级：增加 RPC Fallback 机制
 */
export function useNameRecords(labels: string[]) {
  return useQuery({
    queryKey: ["name-records", labels],
    queryFn: async () => {
      try {
        // 1. 尝试 Graph，设置 5s 超时
        const graphPromise = fetchNameRecordsGraph(labels);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Graph Timeout")), 5000),
        );
        return (await Promise.race([graphPromise, timeoutPromise])) as Awaited<
          ReturnType<typeof fetchNameRecordsGraph>
        >;
      } catch (error) {
        // 2. 失败则降级到 RPC
        console.warn(
          "⚠️ Graph failed/timeout, switching to RPC Fallback",
          error,
        );
        return await fetchNameRecordsRPC(labels);
      }
    },
    enabled: labels.length > 0,
    staleTime: 1000 * 30,
    placeholderData: (previousData, previousQuery) => {
      if (!previousData) return undefined;
      const previousLabels = previousQuery?.queryKey[1] as string[] | undefined;
      if (!previousLabels || !Array.isArray(previousLabels)) return undefined;

      const newLabelSet = new Set(labels);
      const prevLabelSet = new Set(previousLabels);

      const isAppending = previousLabels.every((label) =>
        newLabelSet.has(label),
      );
      const isDeleting = labels.every((label) => prevLabelSet.has(label));

      return isAppending || isDeleting ? previousData : undefined;
    },
  });
}

export function useCollectionRecords(collectionId: string) {
  const collection = ENS_COLLECTIONS[collectionId];
  const labels = collection?.labels || [];

  return useQuery({
    queryKey: ["collection-records", collectionId, labels.length],
    queryFn: async () => {
      try {
        const graphPromise = fetchNameRecordsGraph(labels);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Graph Timeout")), 5000),
        );
        return (await Promise.race([graphPromise, timeoutPromise])) as Awaited<
          ReturnType<typeof fetchNameRecordsGraph>
        >;
      } catch (error) {
        console.warn(
          `⚠️ Graph failed for ${collectionId}, switching to RPC`,
          error,
        );
        return await fetchNameRecordsRPC(labels);
      }
    },
    enabled: !!collection && labels.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

// ... (useEnsLabels 保持不变，因为反查必须依赖 Graph)
export function useEnsLabels(classifiedInputs: ClassifiedInputs) {
  const hasInputs =
    classifiedInputs.sameOwners.length > 0 ||
    classifiedInputs.pureLabels.length > 0 ||
    classifiedInputs.ethAddresses.length > 0;

  return useQuery({
    queryKey: ["ens-labels", classifiedInputs],
    queryFn: () => fetchLabels(classifiedInputs),
    enabled: hasInputs,
    staleTime: 1000 * 60 * 5,
  });
}
