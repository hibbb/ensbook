// src/hooks/useEnsData.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNameRecords } from "../services/graph/fetchNameRecords";
import { fetchLabels } from "../services/graph/fetchLabels";
import type { ClassifiedInputs } from "../utils/parseInputs";
// ⚡️ 必须引入集合配置，以便根据 ID 获取 labels
import { ENS_COLLECTIONS } from "../config/collections";

/**
 * Hook 1: 获取域名详情列表
 * 用于基础的搜索和解析功能
 */
export function useNameRecords(labels: string[]) {
  return useQuery({
    queryKey: ["name-records", labels],
    queryFn: () => fetchNameRecords(labels),
    enabled: labels.length > 0,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData, //
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
