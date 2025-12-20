import { useParams } from "react-router-dom";
import { ENS_COLLECTIONS } from "../config/collections";
import { useCollectionRecords } from "../hooks/useEnsData";
import { isRenewable } from "../utils/ens";
import type { NameRecord } from "../types/ensNames";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;

  // 使用 useCollectionRecords 获取动态数据
  const { data: records, isLoading, isError } = useCollectionRecords(id || "");

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <h2 className="text-xl font-bold">未找到该集合</h2>
        <p className="mt-2 text-sm">请检查路径是否正确</p>
      </div>
    );
  }

  // ⚡️ 处理错误状态：解决 isError 未使用的问题
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center my-10">
        <div className="text-red-500 text-3xl mb-4">⚠️</div>
        <h2 className="text-red-800 font-bold text-lg">数据加载失败</h2>
        <p className="text-red-600 text-sm mt-1">
          无法从 Subgraph 获取实时数据，请稍后重试。
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          重试加载
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 头部信息区 */}
      <header className="mb-12">
        <div className="flex items-baseline gap-4 mb-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            {collection.displayName}
          </h1>
          <span className="text-gray-400 font-mono text-lg">
            {collection.labels.length} items
          </span>
        </div>
        <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
          {collection.description}
        </p>
      </header>

      {/* 域名列表网格 */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* 骨架屏加载态 */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-100 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {records?.map((record: NameRecord) => (
            <div
              key={record.namehash}
              className="group bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-xl font-bold text-gray-800 mb-1 truncate">
                {record.label}
                <span className="text-gray-300 font-normal">.eth</span>
              </div>

              <div
                className={`text-xs font-semibold mb-6 inline-flex px-2 py-0.5 rounded-full ${getStatusStyles(record.status)}`}
              >
                {record.status}
              </div>

              {/* 动作按钮逻辑 */}
              <div className="pt-2">
                {isRenewable(record) ? (
                  <button className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all">
                    更新续费
                  </button>
                ) : (
                  <button className="w-full py-2.5 bg-white border-2 border-green-500 text-green-600 text-sm font-bold rounded-xl hover:bg-green-50 transition-all">
                    立即注册
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 根据状态返回 Tailwind 样式
 */
function getStatusStyles(status: NameRecord["status"]) {
  switch (status) {
    case "Active":
      return "bg-green-50 text-green-600";
    case "GracePeriod":
      return "bg-orange-50 text-orange-600";
    case "PremiumPeriod":
      return "bg-purple-50 text-purple-600";
    case "Available":
      return "bg-gray-50 text-gray-500";
    case "Released":
      return "bg-red-50 text-red-500";
    default:
      return "bg-gray-50 text-gray-400";
  }
}
