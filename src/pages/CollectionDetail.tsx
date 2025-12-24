// src/pages/CollectionDetail.tsx

import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { NameTable } from "../components/NameTable";
import { useCollectionRecords } from "../hooks/useEnsData";
import { ENS_COLLECTIONS } from "../config/collections";
import { useNameTableLogic } from "../components/NameTable/useNameTableLogic";
// 1. 引入新 Hook
import { usePrimaryNames } from "../hooks/usePrimaryNames";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { address, isConnected } = useAccount();

  // 2. 获取基础数据 (Subgraph 秒级返回，此时不含主域名)
  // 将原本的 records 重命名为 basicRecords，以示区别
  const {
    data: basicRecords,
    isLoading,
    isError,
  } = useCollectionRecords(id || "");

  // 3. 接入渐进式加载 Hook (关键步骤 🚀)
  // - basicRecords 到达时，records 会立即有值 (显示 0x 地址)
  // - 几秒后 RPC 查询完成，records 会自动更新 (显示 vitalik.eth)
  const records = usePrimaryNames(basicRecords);

  // 4. 将增强后的 records 传给表格逻辑
  // useNameTableLogic 会自动处理排序和过滤，当 records 更新时它也会自动重新计算
  const {
    processedRecords,
    sortConfig,
    filterConfig,
    handleSort,
    setFilterConfig,
  } = useNameTableLogic(records, address);

  if (!collection) return <div className="p-20 text-center">集合未找到</div>;
  if (isError)
    return <div className="p-20 text-center text-red-500">加载失败</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-qs-semibold">{collection.displayName}</h1>
        <p className="text-gray-400">{collection.description}</p>
      </header>

      <NameTable
        records={processedRecords}
        isLoading={isLoading} // 这里的 isLoading 仅代表 Subgraph 基础数据是否加载完
        currentAddress={address}
        isConnected={isConnected}
        sortConfig={sortConfig}
        onSort={handleSort}
        filterConfig={filterConfig}
        onFilterChange={setFilterConfig}
        canDelete={false} // 集合页不允许删除
      />
    </div>
  );
};
