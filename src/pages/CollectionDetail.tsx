import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { NameTable } from "../components/NameTable";
import { useCollectionRecords } from "../hooks/useEnsData";
import { ENS_COLLECTIONS } from "../config/collections";
import { useNameTableLogic } from "../components/NameTable/useNameTableLogic";
// 🚀 1. 重新引入渐进式加载 Hook
import { usePrimaryNames } from "../hooks/usePrimaryNames";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { address, isConnected } = useAccount();

  // 🚀 2. 获取基础数据 (Subgraph 秒级返回，但 ownerPrimaryName 为空)
  // 将原先的 records 重命名为 basicRecords
  const {
    data: basicRecords,
    isLoading,
    isError,
  } = useCollectionRecords(id || "");

  // 🚀 3. 补全主域名信息 (关键修复！)
  // 这会先返回 basicRecords，然后在后台异步加载域名，完成后自动刷新
  const records = usePrimaryNames(basicRecords);

  // 🚀 4. 使用补全后的 records 初始化表格逻辑
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

  const handleBatchRenewal = () => {
    if (selectedLabels.size === 0) return;
    renewBatch(Array.from(selectedLabels), 31536000n).then(() => {
      // 交易提交后，可选操作：清空选中
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
              disabled={isBusy || !isConnected}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm ${
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
