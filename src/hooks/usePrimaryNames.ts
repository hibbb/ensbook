// src/hooks/usePrimaryNames.ts

import { useState, useEffect, useMemo } from "react";
import { fetchPrimaryNames } from "../utils/fetchPrimaryNames";
import type { NameRecord } from "../types/ensNames";

/**
 * 渐进式加载主域名 Hook
 *
 * 改进点：
 * 1. 修复大小写匹配问题，确保能查找到 Checksum 地址对应的主域名。
 */
export const usePrimaryNames = (records: NameRecord[] | undefined) => {
  // 1. 只存储异步获取到的主域名映射 (Address -> Name)
  // Key 统一存储为小写地址，确保查找时的一致性
  const [primaryNames, setPrimaryNames] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    // 如果没有数据，或者数据为空，直接跳过
    if (!records || records.length === 0) return;

    // 2. 提取所有有效的所有者地址
    const owners = Array.from(
      new Set(
        records
          .map((r) => r.owner)
          .filter((o): o is string => !!o && o.startsWith("0x")),
      ),
    );

    if (owners.length === 0) return;

    // 3. 标记副作用是否有效
    let isMounted = true;

    // 4. 后台静默发起请求
    fetchPrimaryNames(owners).then((newNameMap) => {
      if (!isMounted) return;

      // 5. 更新状态
      setPrimaryNames((prev) => {
        const next = new Map(prev);
        newNameMap.forEach((name, address) => {
          // fetchPrimaryNames 已经保证 address 是小写
          next.set(address, name);
        });
        return next;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [records]);

  // 6. 渲染时计算：将原始记录与主域名合并
  const enrichedRecords = useMemo(() => {
    if (!records) return undefined;

    return records.map((record) => {
      // 将 record.owner 转为小写后再去 Map 中查找
      // 因为 fetchPrimaryNames 返回的 Map key 全是小写的
      const lowerOwner = record.owner?.toLowerCase();

      const primaryName = lowerOwner ? primaryNames.get(lowerOwner) : undefined;

      // 如果找到了，就覆盖；否则保持原样
      return primaryName
        ? { ...record, ownerPrimaryName: primaryName }
        : record;
    });
  }, [records, primaryNames]);

  return enrichedRecords;
};
