// src/pages/Home.tsx
import { useState, useEffect, useMemo } from "react";
// import { useQueryClient } from "@tanstack/react-query"; // 移除了未使用的引用
import { useAccount } from "wagmi"; // 确保引入了 useAccount
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faRotate,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

// Components & Utils
import { NameTable } from "../components/NameTable";
import { useNameTableLogic } from "../components/NameTable/useNameTableLogic";
import { parseAndClassifyInputs } from "../utils/parseInputs";
import { fetchLabels } from "../services/graph/fetchLabels"; // 确认路径

// Hooks
import { useNameRecords } from "../hooks/useEnsData";
import { usePrimaryNames } from "../hooks/usePrimaryNames";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { getStoredLabels, saveStoredLabels } from "../services/storage/labels";
import type { NameRecord } from "../types/ensNames";

export const Home = () => {
  const { address, isConnected } = useAccount();

  // 1. 核心状态
  const [resolvedLabels, setResolvedLabels] = useState<string[]>(() =>
    getStoredLabels(),
  );

  // 2. 持久化
  useEffect(() => {
    saveStoredLabels(resolvedLabels);
  }, [resolvedLabels]);

  const [inputValue, setInputValue] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // 3. 数据钩子 (应用了 O(N) 优化的 Hook)
  const { data: records, isLoading: isQuerying } =
    useNameRecords(resolvedLabels);

  // 4. 客户端过滤：防止缓存数据“诈尸” (Double Safety)
  const validRecords = useMemo(() => {
    if (!records || resolvedLabels.length === 0) return [];

    // 优化：将 resolvedLabels 转为 Set 避免重复遍历
    const currentLabelSet = new Set(resolvedLabels);

    // 过滤掉不在当前列表中的旧缓存数据
    return records.filter((r) => currentLabelSet.has(r.label));
  }, [records, resolvedLabels]);

  // 5. 渐进式加载主域名
  const enrichedRecords = usePrimaryNames(validRecords);

  // 6. 表格逻辑
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

  // --- 交互处理 ---

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setIsResolving(true);
    try {
      // Step 1: 解析输入
      const classified = parseAndClassifyInputs(inputValue);

      // Step 2: 链上反查获取 labels
      const fetchedLabels = await fetchLabels(classified);

      if (fetchedLabels.length > 0) {
        // 🚀 修复：在更新状态前，先利用当前的 resolvedLabels 计算新增项
        // 这样既避免了在 setState 中执行副作用，又解决了 StrictMode 下的双重触发问题
        const currentSet = new Set(resolvedLabels);
        const newUniqueLabels = fetchedLabels.filter((l) => !currentSet.has(l));

        if (newUniqueLabels.length === 0) {
          toast("所有域名已存在列表中", { icon: "👌" });
          // 这里不需要更新状态，直接返回即可
        } else {
          // 执行状态更新
          setResolvedLabels((prev) => [...prev, ...newUniqueLabels]);
          // 执行副作用 (Toast)
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

  const handleClearAll = () => {
    if (window.confirm("确定要清空所有历史记录吗？")) {
      setResolvedLabels([]);
      clearSelection();
    }
  };

  const handleBatchRenewal = () => {
    if (selectedLabels.size === 0) return;
    renewBatch(Array.from(selectedLabels), 31536000n).then(() => {
      // Optional: 清空选择或保留
    });
  };

  // 骨架屏显示逻辑
  const showSkeleton =
    isQuerying && resolvedLabels.length > 0 && validRecords.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 relative min-h-[85vh] flex flex-col">
      {/* 输入区域 (保持之前的样式不变) */}
      <div
        className={`flex flex-col items-center transition-all duration-700 ease-in-out z-10 ${
          hasContent ? "pt-8 mb-6" : "flex-1 justify-center -mt-60"
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
            <input
              type="text"
              className="w-full h-14 pl-6 pr-14 rounded-full border border-gray-200 bg-white shadow-sm text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-link/20 focus:border-link transition-all"
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
              className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-full bg-link text-white hover:bg-link-hover disabled:bg-gray-200 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
            >
              {isResolving ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faArrowRight} />
              )}
            </button>
          </div>

          {hasContent && (
            <div className="absolute -right-24 top-1/2 -translate-y-1/2 hidden xl:block">
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <FontAwesomeIcon icon={faTrash} /> 清空列表
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 结果展示区域 */}
      {hasContent && (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards pb-20">
          <div className="flex justify-end mb-2 xl:hidden">
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              清空历史
            </button>
          </div>

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
            selectedLabels={selectedLabels}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={toggleSelectAll}
            skeletonRows={5}
          />
        </div>
      )}

      {/* 批量续费 Bar (保持不变) */}
      {selectedLabels.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4">
            {/* ... 内容保持不变 ... */}
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
    </div>
  );
};
