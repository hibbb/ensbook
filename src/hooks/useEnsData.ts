// src/hooks/useEnsData.ts

import { useQuery } from "@tanstack/react-query";
import { fetchNameRecords } from "../services/graph/fetchNameRecords";
import { fetchLabels } from "../services/graph/fetchLabels";
import type { ClassifiedInputs } from "../utils/parseInputs";
import { ENS_COLLECTIONS } from "../config/collections";

/**
 * Hook 1: 获取通用域名列表 (Home 页)
 */
export function useNameRecords(labels: string[]) {
  return useQuery({
    queryKey: ["name-records", labels],
    queryFn: () => fetchNameRecords(labels),
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

/**
 * Hook 2: 获取特定集合的域名详情 (集合页)
 */
export function useCollectionRecords(collectionId: string) {
  const collection = ENS_COLLECTIONS[collectionId];
  const labels = collection?.labels || [];

  return useQuery({
    queryKey: ["collection-records", collectionId, labels.length],
    queryFn: () => fetchNameRecords(labels),
    enabled: !!collection && labels.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook 3: 反查/解析域名
 */
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
