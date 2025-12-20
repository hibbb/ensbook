// src/pages/Home.tsx
import { useState } from "react";
import { parseAndClassifyInputs } from "../utils/parseInputs";
import { useNameRecords } from "../hooks/useEnsData";
import { isRenewable } from "../utils/ens";
import type { NameRecord } from "../types/ensNames";

export const Home = () => {
  const [rawInput, setRawInput] = useState("");

  // 实时解析输入
  const classified = parseAndClassifyInputs(rawInput);
  const { data: records, isLoading } = useNameRecords(classified.pureLabels);

  return (
    <div className="max-w-3xl mx-auto">
      {/* 输入区域 */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          ENS 批量解析助手
        </h1>
        <p className="text-gray-500 mb-8">
          输入域名（支持空格、逗号分隔），实时查看注册状态
        </p>

        <div className="relative group">
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="例如: vitalik, 000, paradigm.eth..."
            className="w-full h-32 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-base resize-none"
            spellCheck={false}
          />
          <div className="absolute bottom-3 right-4 text-xs text-gray-400">
            已识别: {classified.pureLabels.length}
          </div>
        </div>
      </section>

      {/* 结果列表 */}
      <section>
        {isLoading && (
          <p className="text-center text-gray-400 animate-pulse">
            正在同步链上数据...
          </p>
        )}

        {!isLoading && records && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {records.map((record) => (
              <StatusCard key={record.namehash} record={record} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// 提取子组件以保持 Home 简洁
const StatusCard = ({ record }: { record: NameRecord }) => {
  const renewable = isRenewable(record);

  return (
    <div className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div>
        <div className="font-bold text-lg text-gray-800 flex items-center gap-2">
          {record.label}
          <span className="text-gray-400 font-normal text-sm">.eth</span>
        </div>
        <div
          className={`text-xs mt-1 font-medium ${getStatusColor(record.status)}`}
        >
          {record.status}
        </div>
      </div>

      <button
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          renewable
            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
            : "bg-green-50 text-green-600 hover:bg-green-100"
        }`}
      >
        {renewable ? "续费" : "注册"}
      </button>
    </div>
  );
};

// 状态颜色映射工具
function getStatusColor(status: NameRecord["status"]) {
  switch (status) {
    case "Available":
      return "text-green-500";
    case "Active":
      return "text-blue-500";
    case "GracePeriod":
      return "text-orange-500";
    case "PremiumPeriod":
      return "text-purple-500";
    default:
      return "text-gray-400";
  }
}
