// src/components/NameTable/hooks/useOwnerStats.ts

import { useState, useMemo, useEffect } from "react";
import type { NameRecord } from "../../../types/ensNames";
import { truncateAddress } from "../../../utils/format";
import { fetchPrimaryNames } from "../../../utils/fetchPrimaryNames";

interface UseOwnerStatsProps {
  baseRecords: NameRecord[];
  currentAddress?: string;
  passOthers: (r: NameRecord, exclude: string[]) => boolean;
}

export const useOwnerStats = ({
  baseRecords,
  currentAddress,
  passOthers,
}: UseOwnerStatsProps) => {
  const [resolvedOwnerNames, setResolvedOwnerNames] = useState<
    Record<string, string>
  >({});
  const myAddressLower = currentAddress?.toLowerCase();

  // 1. 计算原始排序列表
  const rawSortedOwners = useMemo(() => {
    const ownerMap = new Map<
      string,
      { count: number; label: string; address: string; isMyself: boolean }
    >();

    let mineCount = 0;
    let totalOwnerRecords = 0;

    baseRecords
      .filter((r) => passOthers(r, ["owner"]))
      .forEach((r) => {
        if (!r.owner) return;
        const key = r.owner.toLowerCase();

        totalOwnerRecords++;
        if (key === myAddressLower) {
          mineCount++;
        }

        let current = ownerMap.get(key);
        if (!current) {
          current = {
            count: 0,
            label: "",
            address: key,
            isMyself: key === myAddressLower,
          };
          current.label = truncateAddress(r.owner);
        }

        if (r.ownerPrimaryName) {
          current.label = r.ownerPrimaryName;
        }

        current.count += 1;
        ownerMap.set(key, current);
      });

    const totalOwnersCount = ownerMap.size;

    const allOwners = Array.from(ownerMap.values()).sort((a, b) => {
      if (a.isMyself && !b.isMyself) return -1;
      if (!a.isMyself && b.isMyself) return 1;
      return b.count - a.count;
    });

    return {
      list: allOwners.slice(0, 50),
      stats: {
        total: totalOwnersCount,
        displayed: allOwners.slice(0, 50).length,
      },
      counts: {
        mine: mineCount,
        others: totalOwnerRecords - mineCount,
      },
    };
  }, [baseRecords, passOthers, myAddressLower]);

  // 2. 异步解析副作用
  useEffect(() => {
    if (rawSortedOwners.list.length === 0) return;

    const targetsToResolve = rawSortedOwners.list
      .filter((o) => o.label.startsWith("0x") && !resolvedOwnerNames[o.address])
      .map((o) => o.address);

    if (targetsToResolve.length > 0) {
      const timer = setTimeout(() => {
        fetchPrimaryNames(targetsToResolve).then((newMap) => {
          if (newMap.size > 0) {
            setResolvedOwnerNames((prev) => {
              const next = { ...prev };
              let hasChange = false;
              newMap.forEach((name, addr) => {
                if (next[addr] !== name) {
                  next[addr] = name;
                  hasChange = true;
                }
              });
              return hasChange ? next : prev;
            });
          }
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [rawSortedOwners.list, resolvedOwnerNames]);

  // 3. 合并最终结果
  const ownerCounts = useMemo(() => {
    return rawSortedOwners.list.map((item) => {
      const resolvedName = resolvedOwnerNames[item.address];
      return {
        ...item,
        label: resolvedName || item.label,
      };
    });
  }, [rawSortedOwners.list, resolvedOwnerNames]);

  return {
    ownerCounts,
    ownerStats: rawSortedOwners.stats,
    ownershipCounts: rawSortedOwners.counts,
  };
};
