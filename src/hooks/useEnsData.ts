import { useQuery, keepPreviousData } from "@tanstack/react-query"; // 引入 keepPreviousData
import { fetchNameRecords } from "../services/graph/fetchNameRecords";
import { fetchLabels } from "../services/graph/fetchLabels";
import type { ClassifiedInputs } from "../utils/parseInputs";

/**
 * Hook 1: 获取域名详情列表
 * 对应原来的 fetchNameRecords
 */
export function useNameRecords(labels: string[]) {
  return useQuery({
    queryKey: ["name-records", labels],
    queryFn: () => fetchNameRecords(labels),
    enabled: labels.length > 0,
    staleTime: 1000 * 30,

    // ⚡️ 优化：保留上一次的数据，直到新数据回来
    // 这在搜索联想、分页场景中是 UX 神器
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook 2: 反查/解析域名 (Fetch Labels)
 * 对应原来的 fetchLabels
 */
export function useEnsLabels(classifiedInputs: ClassifiedInputs) {
  // 计算是否有有效输入，用于控制 enabled
  const hasInputs =
    classifiedInputs.sameOwners.length > 0 ||
    classifiedInputs.linkOwners.length > 0 ||
    classifiedInputs.pureLabels.length > 0;

  return useQuery({
    queryKey: ["ens-labels", classifiedInputs],
    queryFn: () => fetchLabels(classifiedInputs),
    enabled: hasInputs,
    // 这个数据通常变动不大，可以缓存久一点
    staleTime: 1000 * 60 * 5, // 5分钟
  });
}
