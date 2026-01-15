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
  memoFilter: "all",
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
  // ... (useState 初始化逻辑保持不变，省略以节省篇幅，请保留原代码) ...
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

  // ... (useEffect for saving state 保持不变) ...
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

  // ... (useEffect for syncing storage 保持不变) ...
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
      // ...
      if (sortConfig.direction === null && DEFAULT_SORT.direction === null) {
        return false;
      }
      return (
        sortConfig.field !== DEFAULT_SORT.field ||
        sortConfig.direction !== DEFAULT_SORT.direction
      );
    })();

    const isFilterDirty =
      // 🚀 检查 memoFilter
      filterConfig.memoFilter !== DEFAULT_FILTER.memoFilter ||
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
    memoFilter = "all",
  } = filterConfig;

  const baseRecords = useMemo(() => records || [], [records]);

  const {
    statusCounts,
    actionCounts,
    nameCounts,
    levelCounts,
    rawSortedOwners,
    ownerStats,
    ownershipCounts,
  } = useMemo(() => {
    // ... (check functions & passOthers 保持不变，省略以节省篇幅) ...
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
    // 🚀 更新 checkMemos (仅用于 passOthers 检查)
    const checkMemos = (r: NameRecord) => {
      const hasMemo = !!r.memo && r.memo.trim().length > 0;
      if (memoFilter === "all") return true;
      if (memoFilter === "with_memo") return hasMemo;
      if (memoFilter === "no_memo") return !hasMemo;
      return true;
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

    // 🚀 更新 Memo 统计逻辑
    // 我们需要统计：在满足"其他"条件的前提下，有备注的多少个，无备注的多少个
    const recordsForMemoStats = baseRecords.filter((r) =>
      passOthers(r, ["memo"]),
    );
    const memosCount = recordsForMemoStats.filter(
      (r) => !!r.memo && r.memo.trim().length > 0,
    ).length;
    // 总数就是 recordsForMemoStats.length (包含了有和无)
    // 无备注数 = 总数 - 有备注数
    // 但为了严谨，我们显式计算一下，或者复用 wrappedCounts.all 类似的逻辑？
    // 注意：这里的 total 应该是 "当前筛选条件下（忽略备注筛选）的总数"
    // 也就是 recordsForMemoStats.length

    // 为了和 NameHeader 的接口对接，我们可以把无备注数量也放进去，或者让 UI 自己减
    // 这里我们稍微修改一下 nameCounts 的结构或者只传 memosCount，UI 根据 total 算 noMemo

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

    // 🚀 逻辑修复 1: 确保 "我自己" 始终在列表中
    // 如果我拥有域名 (mineCount > 0)，但可能因为数量太少被 slice(0, 50) 截掉
    // 我们需要强制保留我。
    const allOwners = Array.from(ownerMap.values()).sort((a, b) => {
      if (a.isMyself && !b.isMyself) return -1;
      if (!a.isMyself && b.isMyself) return 1;
      return b.count - a.count;
    });

    // 简单截取 Top 50
    const sortedOwners = allOwners.slice(0, 50);

    // 检查截取后的列表中是否包含 "我自己"
    // (由于上面已经把 isMyself 排到第一位了，所以如果我有持仓，我一定在 allOwners[0])
    // (slice(0, 50) 肯定会包含 allOwners[0]，除非数组为空)
    // 所以，只要我的 count > 0，上面的排序逻辑已经保证了我会在 Top 50 里。
    // 这个逻辑修复其实主要依赖于上面的 .sort 逻辑 (MySelf first)。
    // 只要 mineCount > 0，我就一定在 sortedOwners[0]。完美。

    return {
      statusCounts,
      actionCounts,
      nameCounts: {
        lengthCounts,
        availableLengths: Array.from(availableLengths).sort((a, b) => a - b),
        wrappedCounts,
        memosCount, // 有备注的数量
        // 🚀 我们可以利用 wrappedCounts.all 作为当前上下文的总数吗？
        // wrappedCounts 是 passOthers(r, ['wrapped']) 算出来的
        // recordsForMemoStats 是 passOthers(r, ['memo']) 算出来的
        // 如果 wrappedType 和 memoFilter 都选了 'all'，那这两个集合是一样的
        // 但如果选了 wrapped=true，那 recordsForMemoStats 就是"所有已包装的域名"
        // 此时 recordsForMemoStats.length 就是当前上下文的总数。
        // 我们最好把这个上下文总数显式传出去，或者复用已有的结构。
        // NameHeader 目前用 wrappedCounts.all 作为 totalCount。
        // 这在 wrappedType='all' 时是正确的。
        // 但如果 wrappedType != 'all'，NameHeader 里的 totalCount 也会变小，这是符合预期的。
        // 所以我们不需要改结构，只需要知道：
        // Total (in NameHeader context) = recordsForMemoStats.length
      },
      levelCounts,
      rawSortedOwners: sortedOwners,
      ownerStats: {
        total: totalOwnersCount,
        displayed: sortedOwners.length,
      },
      ownershipCounts: {
        mine: mineCount,
        others: totalOwnerRecords - mineCount,
      },
    };
  }, [
    baseRecords,
    statusList,
    actionType,
    lengthList,
    wrappedType,
    memoFilter,
    levelList,
    ownerList,
    currentAddress,
  ]);

  // 🚀 性能优化 2: 延迟/错峰解析 (Debounce)
  useEffect(() => {
    if (rawSortedOwners.length === 0) return;

    // 筛选出需要解析的
    const targetsToResolve = rawSortedOwners
      .filter((o) => o.label.startsWith("0x") && !resolvedOwnerNames[o.address])
      .map((o) => o.address);

    if (targetsToResolve.length === 0) return;

    // 设置一个 1.5秒 的定时器
    // 这让 Table 组件有时间先发起它的 50 个请求，渲染出首屏
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
    }, 1500); // 1500ms 延迟

    return () => clearTimeout(timer);
  }, [rawSortedOwners, resolvedOwnerNames]); // 注意：这会随着 filters 变化而触发，是预期的

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

  // ... (handleSort, etc. 保持不变) ...
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
    ownerStats,
    ownershipCounts,
  };
};
