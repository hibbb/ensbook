// src/components/NameTable/hooks/useTableStats.ts

import { useMemo } from "react";
import type { NameRecord } from "../../../types/ensNames";
import { isRenewable, isRegistrable } from "../../../utils/ens";

interface UseTableStatsProps {
  baseRecords: NameRecord[];
  passOthers: (r: NameRecord, exclude: string[]) => boolean;
}

export const useTableStats = ({
  baseRecords,
  passOthers,
}: UseTableStatsProps) => {
  return useMemo(() => {
    const statusCounts: Record<string, number> = {};
    baseRecords
      .filter((r) => passOthers(r, ["status"]))
      .forEach(
        (r) => (statusCounts[r.status] = (statusCounts[r.status] || 0) + 1),
      );

    const recordsForAction = baseRecords.filter((r) =>
      passOthers(r, ["action"]),
    );
    const actionCounts = {
      all: recordsForAction.length,
      register: recordsForAction.filter((r) => isRegistrable(r.status)).length,
      renew: recordsForAction.filter((r) => isRenewable(r.status)).length,
    };

    const lengthCounts: Record<number, number> = {};
    const availableLengths = new Set<number>();
    baseRecords.forEach((r) => availableLengths.add(r.label.length));
    baseRecords
      .filter((r) => passOthers(r, ["length"]))
      .forEach(
        (r) =>
          (lengthCounts[r.label.length] =
            (lengthCounts[r.label.length] || 0) + 1),
      );

    const recordsForWrapped = baseRecords.filter((r) =>
      passOthers(r, ["wrapped"]),
    );
    const wrappedCounts = {
      all: recordsForWrapped.length,
      wrapped: recordsForWrapped.filter((r) => r.wrapped).length,
      unwrapped: recordsForWrapped.filter((r) => !r.wrapped).length,
    };

    const recordsForMemoStats = baseRecords.filter((r) =>
      passOthers(r, ["memo"]),
    );
    const memosCount = recordsForMemoStats.filter(
      (r) => !!r.memo && r.memo.trim().length > 0,
    ).length;
    const memoTotal = recordsForMemoStats.length;

    const levelCounts: Record<number, number> = {};
    baseRecords
      .filter((r) => passOthers(r, ["level"]))
      .forEach(
        (r) =>
          (levelCounts[r.level || 0] = (levelCounts[r.level || 0] || 0) + 1),
      );

    return {
      statusCounts,
      actionCounts,
      nameCounts: {
        lengthCounts,
        availableLengths: Array.from(availableLengths).sort((a, b) => a - b),
        wrappedCounts,
        memosCount,
        memoTotal,
      },
      levelCounts,
    };
  }, [baseRecords, passOthers]);
};
