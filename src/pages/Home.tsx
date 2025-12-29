// src/pages/Home.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useAccount } from "wagmi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faRotate,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { NameTable } from "../components/NameTable";
import { useNameTableLogic } from "../components/NameTable/useNameTableLogic";
import { parseAndClassifyInputs } from "../utils/parseInputs";
import { fetchLabels } from "../services/graph/fetchLabels";
import { SearchHelpModal } from "../components/SearchHelpModal";
import { useNameRecords } from "../hooks/useEnsData";
import { usePrimaryNames } from "../hooks/usePrimaryNames";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { getStoredLabels, saveStoredLabels } from "../services/storage/labels";
import type { NameRecord } from "../types/ensNames";

export const Home = () => {
  const { address, isConnected } = useAccount();

  const [resolvedLabels, setResolvedLabels] = useState<string[]>(() =>
    getStoredLabels(),
  );

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    saveStoredLabels(resolvedLabels);
  }, [resolvedLabels]);

  const [inputValue, setInputValue] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const { data: records, isLoading: isQuerying } =
    useNameRecords(resolvedLabels);

  // 🚀 优化：缓存上一次的有效数据
  // 当进行删除操作导致 records 暂时变为 undefined 时，使用此缓存防止骨架屏闪烁
  const previousRecordsRef = useRef<NameRecord[]>([]);

  useEffect(() => {
    if (records) {
      previousRecordsRef.current = records;
    }
  }, [records]);

  // 使用当前数据，如果为空则回退到缓存数据
  const effectiveRecords = records || previousRecordsRef.current;

  // 4. 客户端过滤 (基于 effectiveRecords 计算)
  const validRecords = useMemo(() => {
    // 这里使用 effectiveRecords 而不是 records
    if (!effectiveRecords || resolvedLabels.length === 0) return [];

    const currentLabelSet = new Set(resolvedLabels);
    // 即使使用旧数据 (effectiveRecords)，过滤逻辑 (currentLabelSet) 是新的
    // 所以被删除的条目会立即从列表中消失，而不会闪烁
    return effectiveRecords.filter((r) => currentLabelSet.has(r.label));
  }, [effectiveRecords, resolvedLabels]);

  const enrichedRecords = usePrimaryNames(validRecords);

  const {
    processedRecords,
    sortConfig,
    filterConfig,
    handleSort,
    setFilterConfig,
    selectedLabels,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
  } = useNameTableLogic(enrichedRecords, address);

  const { renewBatch, isBusy: isRenewalBusy } = useEnsRenewal();
  const hasContent = resolvedLabels.length > 0;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setIsResolving(true);
    try {
      const classified = parseAndClassifyInputs(inputValue);
      const fetchedLabels = await fetchLabels(classified);

      if (fetchedLabels.length > 0) {
        const currentSet = new Set(resolvedLabels);
        const newUniqueLabels = fetchedLabels.filter((l) => !currentSet.has(l));

        if (newUniqueLabels.length === 0) {
          toast("所有域名已存在列表中", { icon: "👌" });
        } else {
          setResolvedLabels((prev) => [...prev, ...newUniqueLabels]);
          toast.success(`成功添加 ${newUniqueLabels.length} 个域名`);
          setInputValue("");
        }
      } else {
        toast("未找到有效的 ENS 域名", { icon: "🤔" });
      }
    } catch (error) {
      console.error("解析失败:", error);
      toast.error("解析输入时出错");
    } finally {
      setIsResolving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleDelete = (record: NameRecord) => {
    setResolvedLabels((prev) => prev.filter((l) => l !== record.label));
    if (selectedLabels.has(record.label)) {
      toggleSelection(record.label);
    }
  };

  // 🚀 1. 新增：批量删除处理函数
  // status 参数：如果为空则为清空所有；如果有值则删除特定状态
  const handleBatchDelete = (status?: string) => {
    // 情况 A: 清空所有 (原 handleClearAll 逻辑)
    if (!status) {
      if (window.confirm("确定要清空所有历史记录吗？")) {
        setResolvedLabels([]);
        clearSelection();
      }
      return;
    }

    // 情况 B: 按状态删除
    // 这里的 records 是 useNameRecords 返回的原始数据，包含了状态信息
    if (!records) return;

    if (window.confirm(`确定要删除所有状态为“${status}”的域名吗？`)) {
      // 1. 找出所有匹配该状态的 label
      const labelsToDelete = new Set(
        records.filter((r) => r.status === status).map((r) => r.label),
      );

      // 2. 更新列表：保留不在删除集合中的域名
      setResolvedLabels((prev) =>
        prev.filter((label) => !labelsToDelete.has(label)),
      );

      // 3. 同步更新选中状态：如果被选中的域名被删除了，也要从选中集合中移除
      if (selectedLabels.size > 0) {
        // 这里可以直接调用 clearSelection 简单处理，或者精细化移除
        // 为了体验平滑，我们精细化移除
        labelsToDelete.forEach((label) => {
          if (selectedLabels.has(label)) {
            toggleSelection(label);
          }
        });
      }

      toast.success(`已删除所有 ${status} 域名`);
    }
  };

  const handleBatchRenewal = () => {
    if (selectedLabels.size === 0) return;
    renewBatch(Array.from(selectedLabels), 31536000n).then(() => {
      // optional
    });
  };

  // 骨架屏显示逻辑
  // 只有在真的没有数据可显示时（初始加载），才显示骨架屏
  const showSkeleton =
    isQuerying && resolvedLabels.length > 0 && validRecords.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 relative min-h-[85vh] flex flex-col">
      <div
        className={`flex flex-col items-center transition-all duration-700 ease-in-out z-40 ${
          hasContent
            ? "sticky top-0 py-4 mb-6 bg-background/80 backdrop-blur-md"
            : "flex-1 justify-center -mt-60"
        }`}
      >
        {!hasContent && (
          <h1 className="text-4xl font-qs-bold text-text-main mb-8 tracking-tight animate-in fade-in zoom-in duration-500">
            ENS <span className="text-link">Search</span>
          </h1>
        )}

        <div
          className={`relative w-full transition-all duration-500 ${hasContent ? "max-w-3xl" : "max-w-2xl"}`}
        >
          <div className="relative group">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="absolute left-2 top-2 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-400 transition-all active:scale-95 z-10"
              title="搜索帮助"
            >
              <FontAwesomeIcon icon={faLightbulb} size="sm" />
            </button>

            <input
              type="text"
              className="w-full h-14 pl-14 pr-14 rounded-full border border-gray-200 bg-white shadow-sm text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-link/20 focus:border-link transition-all"
              placeholder={
                hasContent
                  ? "继续添加域名..."
                  : "输入域名、地址(@0x...) 或 记录(#user)..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              onClick={() => handleSubmit()}
              disabled={!inputValue.trim() || isResolving}
              className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-full bg-link text-white hover:bg-link-hover disabled:bg-gray-200 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isResolving ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faArrowRight} />
              )}
            </button>
          </div>
          {/* 🚀 移除旧的 Desktop 清空按钮 */}
        </div>
      </div>

      {hasContent && (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards pb-20">
          {/* 🚀 移除旧的 Mobile 清空按钮 */}

          <NameTable
            records={processedRecords}
            isLoading={showSkeleton}
            currentAddress={address}
            isConnected={isConnected}
            sortConfig={sortConfig}
            onSort={handleSort}
            filterConfig={filterConfig}
            onFilterChange={setFilterConfig}
            canDelete={true}
            onDelete={handleDelete}
            onBatchDelete={handleBatchDelete} // 🚀 传递新的批量删除回调 (替代原来的 onClearAll)
            selectedLabels={selectedLabels}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={toggleSelectAll}
            skeletonRows={5}
            headerTop="88px"
          />
        </div>
      )}

      {selectedLabels.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-qs-medium text-gray-600">
              已选择{" "}
              <span className="text-link font-bold">{selectedLabels.size}</span>{" "}
              个域名
            </span>
            <div className="h-4 w-px bg-gray-300 mx-1" />
            <button
              onClick={handleBatchRenewal}
              disabled={isRenewalBusy || !isConnected}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                isRenewalBusy || !isConnected
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-link text-white hover:bg-link-hover hover:shadow-md active:scale-95"
              }`}
            >
              <FontAwesomeIcon icon={faRotate} spin={isRenewalBusy} />
              {isRenewalBusy ? "处理中..." : "批量续费 (1年)"}
            </button>
            <button
              onClick={clearSelection}
              className="ml-2 text-xs text-gray-400 hover:text-gray-600 underline decoration-gray-300 underline-offset-2"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <SearchHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
