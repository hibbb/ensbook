// src/pages/CollectionDetail.tsx

import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { NameTable } from "../components/NameTable";
import { useCollectionRecords } from "../hooks/useEnsData";
import { ENS_COLLECTIONS } from "../config/collections";
import { useNameTableLogic } from "../components/NameTable/useNameTableLogic";
import { usePrimaryNames } from "../hooks/usePrimaryNames";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { isRenewable } from "../utils/ens";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { address, isConnected } = useAccount();

  // 1. 获取基础数据
  const {
    data: basicRecords,
    isLoading,
    isError,
  } = useCollectionRecords(id || "");

  // 2. 补全主域名信息
  const records = usePrimaryNames(basicRecords);

  // 3. 表格逻辑 (包含筛选、排序、选择)
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
  } = useNameTableLogic(records, address);

  const { renewBatch, isBusy } = useEnsRenewal();

  // 🚀 核心逻辑：计算“有效选中项”
  // 目的：过滤掉可能存在于 selectedLabels 中但实际上不可续费的域名
  const validSelection = useMemo(() => {
    // 性能优化：如果没有任何选中项或记录为空，直接返回空数组
    if (!processedRecords || selectedLabels.size === 0) return [];

    // 1. 获取当前列表中的所有可续费域名集合 (Set 查找 O(1))
    const renewableSet = new Set(
      processedRecords.filter((r) => isRenewable(r.status)).map((r) => r.label),
    );

    // 2. 取交集：Selected ∩ Renewable
    return Array.from(selectedLabels).filter((label) =>
      renewableSet.has(label),
    );
  }, [processedRecords, selectedLabels]);

  const selectionCount = validSelection.length;

  const handleBatchRenewal = () => {
    // 安全检查：防止提交空数组
    if (selectionCount === 0) return;

    renewBatch(validSelection, 31536000n).then(() => {
      // 成功后是否清空选择？根据需求，目前保留，若需清空可取消注释：
      // clearSelection();
    });
  };

  if (!collection) return <div className="p-20 text-center">集合未找到</div>;
  if (isError)
    return <div className="p-20 text-center text-red-500">加载失败</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pb-24 relative">
      <header className="mb-10">
        <h1 className="text-4xl font-qs-semibold">{collection.displayName}</h1>
        <p className="text-gray-400">{collection.description}</p>
      </header>

      <NameTable
        records={processedRecords}
        isLoading={isLoading}
        currentAddress={address}
        isConnected={isConnected}
        sortConfig={sortConfig}
        onSort={handleSort}
        filterConfig={filterConfig}
        onFilterChange={setFilterConfig}
        canDelete={false}
        selectedLabels={selectedLabels}
        onToggleSelection={toggleSelection}
        onToggleSelectAll={toggleSelectAll}
      />

      {/* 底部悬浮操作栏 */}
      {selectionCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-qs-medium text-gray-600">
              已选择{" "}
              <span className="text-link font-bold">{selectionCount}</span>{" "}
              个域名
            </span>

            <div className="h-4 w-px bg-gray-300 mx-1" />

            <button
              onClick={handleBatchRenewal}
              disabled={isBusy || !isConnected}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-qs-semibold transition-all shadow-sm ${
                isBusy || !isConnected
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-link text-white hover:bg-link-hover hover:shadow-md active:scale-95"
              }`}
            >
              <FontAwesomeIcon icon={faRotate} spin={isBusy} />
              {isBusy ? "处理中..." : "批量续费 (1年)"}
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
