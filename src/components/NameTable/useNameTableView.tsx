// src/components/NameTable/useNameTableView.tsx

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { NameRecord } from "../../types/ensNames";
import { isRenewable, isRegistrable } from "../../utils/ens";
import type { SortField, SortConfig, FilterConfig } from "./types";
import { processNameRecords } from "./utils";
import {
  getHomeViewState,
  saveHomeViewState,
  getCollectionViewState,
  saveCollectionViewState,
} from "../../services/storage/userStore";
import type { PageViewState } from "../../types/userData";
import { truncateAddress } from "../../utils/format";
import { fetchPrimaryNames } from "../../utils/fetchPrimaryNames";

export const DEFAULT_SORT: SortConfig = { field: "status", direction: null };
export const DEFAULT_FILTER: FilterConfig = {
  statusList: [],
  onlyWithMemos: false,
  actionType: "all",
  lengthList: [],
  wrappedType: "all",
  levelList: [],
  ownerList: [],
};

export const useNameTableView = (
  records: NameRecord[] | undefined,
  currentAddress?: string,
  context?: "home" | "collection",
  collectionId?: string,
) => {
  const getSavedState = useCallback((): PageViewState => {
    if (context === "home") return getHomeViewState();
    if (context === "collection" && collectionId)
      return getCollectionViewState(collectionId);
    return {};
  }, [context, collectionId]);

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const saved = getSavedState();
    return saved.sort || DEFAULT_SORT;
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>(() => {
    const saved = getSavedState();
    return { ...DEFAULT_FILTER, ...(saved.filter || {}) };
  });

  const currentKey = `${context}-${collectionId}`;
  const [prevKey, setPrevKey] = useState(currentKey);

  if (prevKey !== currentKey) {
    const saved = getSavedState();
    setSortConfig(saved.sort || DEFAULT_SORT);
    setFilterConfig({ ...DEFAULT_FILTER, ...(saved.filter || {}) });
    setPrevKey(currentKey);
  }

  const isInternalWrite = useRef(false);

  useEffect(() => {
    if (!context) return;
    const viewState: PageViewState = { sort: sortConfig, filter: filterConfig };
    isInternalWrite.current = true;
    try {
      if (context === "home") {
        saveHomeViewState(viewState);
      } else if (context === "collection" && collectionId) {
        saveCollectionViewState(collectionId, viewState);
      }
    } catch (e) {
      console.warn("Failed to save view state:", e);
    } finally {
      setTimeout(() => {
        isInternalWrite.current = false;
      }, 0);
    }
  }, [sortConfig, filterConfig, context, collectionId]);

  useEffect(() => {
    const handleExternalUpdate = () => {
      if (isInternalWrite.current) return;
      const saved = getSavedState();
      const isStorageReset = !saved.filter && !saved.sort;
      if (isStorageReset) {
        setSortConfig(DEFAULT_SORT);
        setFilterConfig(DEFAULT_FILTER);
      }
    };

    window.addEventListener("user-settings-updated", handleExternalUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key && e.key.includes("ensbook_user_data")) {
        handleExternalUpdate();
      }
    });

    return () => {
      window.removeEventListener("user-settings-updated", handleExternalUpdate);
      window.removeEventListener("storage", handleExternalUpdate);
    };
  }, [getSavedState]);

  const isViewStateDirty = useMemo(() => {
    const isSortDirty = (() => {
      if (sortConfig.direction === null && DEFAULT_SORT.direction === null) {
        return false;
      }
      return (
        sortConfig.field !== DEFAULT_SORT.field ||
        sortConfig.direction !== DEFAULT_SORT.direction
      );
    })();

    const isFilterDirty =
      filterConfig.onlyWithMemos !== DEFAULT_FILTER.onlyWithMemos ||
      filterConfig.actionType !== DEFAULT_FILTER.actionType ||
      filterConfig.wrappedType !== DEFAULT_FILTER.wrappedType ||
      (filterConfig.statusList?.length || 0) > 0 ||
      (filterConfig.lengthList?.length || 0) > 0 ||
      (filterConfig.levelList?.length || 0) > 0 ||
      (filterConfig.ownerList?.length || 0) > 0;

    return isSortDirty || isFilterDirty;
  }, [sortConfig, filterConfig]);

  const resetViewState = useCallback(() => {
    setSortConfig(DEFAULT_SORT);
    setFilterConfig(DEFAULT_FILTER);
  }, []);

  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());
  const [resolvedOwnerNames, setResolvedOwnerNames] = useState<
    Record<string, string>
  >({});

  const {
    statusList = [],
    actionType = "all",
    lengthList = [],
    wrappedType = "all",
    levelList = [],
    ownerList = [],
  } = filterConfig;

  const baseRecords = useMemo(() => records || [], [records]);

  const {
    statusCounts,
    actionCounts,
    nameCounts,
    levelCounts,
    rawSortedOwners,
    ownerStats, // 🚀 导出统计数据
  } = useMemo(() => {
    const checkStatus = (r: NameRecord) =>
      statusList.length === 0 || statusList.includes(r.status);
    const checkAction = (r: NameRecord) => {
      if (actionType === "all") return true;
      if (actionType === "renew") return isRenewable(r.status);
      if (actionType === "register") return isRegistrable(r.status);
      return false;
    };
    const checkLength = (r: NameRecord) =>
      lengthList.length === 0 || lengthList.includes(r.label.length);
    const checkWrapped = (r: NameRecord) => {
      if (wrappedType === "all") return true;
      return wrappedType === "wrapped" ? r.wrapped : !r.wrapped;
    };
    const checkMemos = (r: NameRecord) => {
      if (!filterConfig.onlyWithMemos) return true;
      return !!r.memo && r.memo.trim().length > 0;
    };
    const checkLevel = (r: NameRecord) =>
      levelList.length === 0 || levelList.includes(r.level || 0);
    const checkOwner = (r: NameRecord) =>
      ownerList.length === 0 ||
      (!!r.owner && ownerList.includes(r.owner.toLowerCase()));

    const passOthers = (
      r: NameRecord,
      exclude: (
        | "status"
        | "action"
        | "length"
        | "wrapped"
        | "memo"
        | "level"
        | "owner"
      )[],
    ) => {
      if (!exclude.includes("status") && !checkStatus(r)) return false;
      if (!exclude.includes("action") && !checkAction(r)) return false;
      if (!exclude.includes("length") && !checkLength(r)) return false;
      if (!exclude.includes("wrapped") && !checkWrapped(r)) return false;
      if (!exclude.includes("memo") && !checkMemos(r)) return false;
      if (!exclude.includes("level") && !checkLevel(r)) return false;
      if (!exclude.includes("owner") && !checkOwner(r)) return false;
      return true;
    };

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

    const recordsWithMemos = baseRecords.filter(
      (r) => passOthers(r, ["memo"]) && !!r.memo && r.memo.trim().length > 0,
    );
    const memosCount = recordsWithMemos.length;

    const levelCounts: Record<number, number> = {};
    baseRecords
      .filter((r) => passOthers(r, ["level"]))
      .forEach(
        (r) =>
          (levelCounts[r.level || 0] = (levelCounts[r.level || 0] || 0) + 1),
      );

    // --- Owner Counts Calculation ---
    const ownerMap = new Map<
      string,
      { count: number; label: string; address: string; isMyself: boolean }
    >();
    const myAddressLower = currentAddress?.toLowerCase();

    baseRecords
      .filter((r) => passOthers(r, ["owner"]))
      .forEach((r) => {
        if (!r.owner) return;
        const key = r.owner.toLowerCase();

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

    // 🚀 1. 统计总数
    const totalOwnersCount = ownerMap.size;

    const sortedOwners = Array.from(ownerMap.values())
      .sort((a, b) => {
        if (a.isMyself && !b.isMyself) return -1;
        if (!a.isMyself && b.isMyself) return 1;
        return b.count - a.count;
      })
      .slice(0, 50); // Top 50

    return {
      statusCounts,
      actionCounts,
      nameCounts: {
        lengthCounts,
        availableLengths: Array.from(availableLengths).sort((a, b) => a - b),
        wrappedCounts,
        memosCount,
      },
      levelCounts,
      rawSortedOwners: sortedOwners,
      // 🚀 2. 返回统计对象
      ownerStats: {
        total: totalOwnersCount,
        displayed: sortedOwners.length,
      },
    };
  }, [
    baseRecords,
    statusList,
    actionType,
    lengthList,
    wrappedType,
    filterConfig.onlyWithMemos,
    levelList,
    ownerList,
    currentAddress,
  ]);

  // Lazy Resolution
  useEffect(() => {
    if (rawSortedOwners.length === 0) return;

    const targetsToResolve = rawSortedOwners
      .filter((o) => o.label.startsWith("0x") && !resolvedOwnerNames[o.address])
      .map((o) => o.address);

    if (targetsToResolve.length > 0) {
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
    }
  }, [rawSortedOwners, resolvedOwnerNames]);

  const ownerCounts = useMemo(() => {
    return rawSortedOwners.map((item) => {
      const resolvedName = resolvedOwnerNames[item.address];
      return {
        ...item,
        label: resolvedName || item.label,
      };
    });
  }, [rawSortedOwners, resolvedOwnerNames]);

  const processedRecords = useMemo(
    () => processNameRecords(baseRecords, sortConfig, filterConfig),
    [baseRecords, sortConfig, filterConfig],
  );

  const handleSort = useCallback((field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field !== field) return { field, direction: "asc" };
      if (prev.direction === null) return { field, direction: "asc" };
      if (prev.direction === "asc") return { field, direction: "desc" };
      if (prev.direction === "desc") return { field, direction: null };
      return { field, direction: "asc" };
    });
  }, []);

  const toggleSelection = useCallback((label: string) => {
    setSelectedLabels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) newSet.delete(label);
      else newSet.add(label);
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedLabels(new Set()), []);

  const toggleSelectAll = useCallback(() => {
    const renewableInView = processedRecords.filter((r) =>
      isRenewable(r.status),
    );
    if (renewableInView.length === 0) return;
    const allSelected = renewableInView.every((r) =>
      selectedLabels.has(r.label),
    );
    if (allSelected) {
      clearSelection();
    } else {
      setSelectedLabels((prev) => {
        const newSet = new Set(prev);
        renewableInView.forEach((r) => newSet.add(r.label));
        return newSet;
      });
    }
  }, [processedRecords, selectedLabels, clearSelection]);

  return {
    processedRecords,
    sortConfig,
    filterConfig,
    handleSort,
    setFilterConfig,
    selectedLabels,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    statusCounts,
    actionCounts,
    nameCounts,
    isViewStateDirty,
    resetViewState,
    levelCounts,
    ownerCounts,
    ownerStats, // 🚀 3. 导出给组件使用
  };
};
