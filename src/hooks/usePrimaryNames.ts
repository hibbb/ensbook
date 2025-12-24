// src/hooks/usePrimaryNames.ts

import { useState, useEffect, useMemo } from "react";
import { fetchPrimaryNames } from "../utils/fetchPrimaryNames";
import type { NameRecord } from "../types/ensNames";

/**
 * 🚀 渐进式加载主域名 Hook (修复版)
 *
 * 改进点：
 * 1. 移除同步 setState，修复 React 警告。
 * 2. 状态分离：只存储异步获取的 "Names"，不再复制 records。
 * 3. 实时合并：在渲染期间通过 useMemo 合并数据。
 */
export const usePrimaryNames = (records: NameRecord[] | undefined) => {
  // 1. 只存储异步获取到的主域名映射 (Address -> Name)
  // 使用 Map 可以让查找速度达到 O(1)
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

    // 3. 标记副作用是否有效 (防止组件卸载后更新状态)
    let isMounted = true;

    // 4. 后台静默发起请求
    fetchPrimaryNames(owners).then((newNameMap) => {
      if (!isMounted) return;

      // 5. 更新状态：将新获取的名字合并到现有的 Map 中
      // 这样即使列表发生变化（如分页），缓存的名字依然有效
      setPrimaryNames((prev) => {
        const next = new Map(prev);
        newNameMap.forEach((name, address) => {
          next.set(address, name);
        });
        return next;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [records]); // 当基础数据变化时，触发新一轮查询

  // 6. 渲染时计算：将原始记录与主域名合并
  // 只有当 records 或 primaryNames 变化时才重新计算
  const enrichedRecords = useMemo(() => {
    if (!records) return undefined;

    return records.map((record) => {
      // 尝试从状态中查找主域名
      const primaryName = record.owner
        ? primaryNames.get(record.owner)
        : undefined;

      // 如果找到了，就覆盖；否则保持原样 (undefined)
      return primaryName
        ? { ...record, ownerPrimaryName: primaryName }
        : record;
    });
  }, [records, primaryNames]);

  return enrichedRecords;
};
