import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { NameTable } from "../components/NameTable";
import { useCollectionRecords } from "../hooks/useEnsData"; //
import { ENS_COLLECTIONS } from "../config/collections";
import { useNameTableLogic } from "../components/NameTable/useNameTableLogic";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { address, isConnected } = useAccount();
  const { data: records, isLoading, isError } = useCollectionRecords(id || "");

  // 🚀 一行代码调用所有表格逻辑
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
        isLoading={isLoading}
        currentAddress={address}
        isConnected={isConnected}
        sortConfig={sortConfig}
        onSort={handleSort}
        filterConfig={filterConfig}
        onFilterChange={setFilterConfig}
      />
    </div>
  );
};
