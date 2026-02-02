// src/hooks/useOptimisticNameUpdate.ts

/**
 * ---------------------------------------------------------------------------
 * 架构说明：乐观更新 (Optimistic Updates)
 * ---------------------------------------------------------------------------
 *
 * 目的：
 * 解决 The Graph 索引延迟导致的用户体验问题。
 * 当用户完成注册或续费后，链上数据已变，但 The Graph API 可能需要数分钟才能同步。
 * 此 Hook 负责在交易确认后，立即手动修改本地 React Query 缓存，
 * 让 UI 瞬间反馈最新状态，消除用户焦虑。
 *
 * 工作原理：
 * 1. 这是一个纯内存操作，不涉及网络请求。
 * 2. 它会同时更新 Home、Collection、Account 等所有视图的缓存。
 * 3. 它只是一种“临时欺骗”，我们依然会在后台延迟触发真正的 refetch，
 *    一旦 The Graph 数据同步，真实数据将覆盖这里的修改。
 *
 * 安全性：
 * 即使计算有细微偏差，最终一致性（Eventual Consistency）由 React Query 的 refetch 保证。
 * ---------------------------------------------------------------------------
 */

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NameRecord } from "../types/ensNames";
import { GRACE_PERIOD_DURATION } from "../config/constants";

export const useOptimisticNameUpdate = () => {
  const queryClient = useQueryClient();

  // 内部辅助：遍历并更新所有相关的查询缓存
  const applyUpdate = useCallback(
    (updater: (record: NameRecord) => NameRecord) => {
      const queryKeys = [
        ["name-records"], // Home 页
        ["collection-records"], // 集合页
        ["account-labels"], // 账户页
      ];

      queryKeys.forEach((key) => {
        // 使用 setQueriesData 进行模糊匹配更新 (match partial query keys)
        queryClient.setQueriesData<NameRecord[]>(
          { queryKey: key },
          (oldData) => {
            if (!oldData) return oldData;
            return oldData.map(updater);
          },
        );
      });
    },
    [queryClient],
  );

  /**
   * 场景 A: 续费成功
   * 逻辑：在原有过期时间基础上增加时长，状态设为 Active
   */
  const updateRenewal = useCallback(
    (labels: string[], duration: bigint) => {
      const durationNum = Number(duration);
      const labelSet = new Set(labels);

      applyUpdate((record) => {
        if (!labelSet.has(record.label)) return record;

        // 简单的数学计算：原过期时间 + 续费秒数
        const newExpiry = record.expiryTime + durationNum;

        return {
          ...record,
          expiryTime: newExpiry,
          // 释放时间随之顺延
          releaseTime: newExpiry + GRACE_PERIOD_DURATION,
          // 只要续费了，状态必然回归 Active
          status: "Active",
        };
      });
    },
    [applyUpdate],
  );

  /**
   * 场景 B: 注册成功
   * 逻辑：填入 Owner，设置当前时间为注册时间，计算过期时间
   */
  const updateRegistration = useCallback(
    (label: string, duration: bigint, owner: string) => {
      const now = Math.floor(Date.now() / 1000);
      const durationNum = Number(duration);

      applyUpdate((record) => {
        if (record.label !== label) return record;

        const newExpiry = now + durationNum;

        return {
          ...record,
          status: "Active",
          owner: owner.toLowerCase(), // 保持地址小写规范
          registeredTime: now,
          expiryTime: newExpiry,
          releaseTime: newExpiry + GRACE_PERIOD_DURATION,
          wrapped: false, // 新注册的域名默认未被 Wrap
        };
      });
    },
    [applyUpdate],
  );

  return {
    updateRenewal,
    updateRegistration,
  };
};
