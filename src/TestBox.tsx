import { useState } from "react";
import { useAccount } from "wagmi";
import { useEnsRenewal } from "./hooks/useEnsRenewal";
import { parseAndClassifyInputs } from "./utils/parseInputs"; // 复用你之前定义的解析工具

// 常用时长常量 (秒)
const DURATION_ONE_YEAR = 31536000n;
// 28天 + 1小时 (之前的测试需求)
const DURATION_SHORT_TEST = 2422800n;

export const TestBox = () => {
  const { address, isConnected } = useAccount();

  // 引入我们刚写好的 Hook
  const { status, isBusy, renewSingle, renewBatch, resetStatus } =
    useEnsRenewal();

  // 本地表单状态
  const [singleLabel, setSingleLabel] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [duration, setDuration] = useState<bigint>(DURATION_ONE_YEAR);

  // --- 处理函数 ---

  const handleSingleSubmit = async () => {
    if (!singleLabel) return;
    // 调用 hook
    await renewSingle(singleLabel, duration);
  };

  const handleBatchSubmit = async () => {
    if (!batchInput) return;

    // 1. 使用你现有的工具解析输入
    const classified = parseAndClassifyInputs(batchInput);

    // 2. 提取所有解析出的有效名称 (合并 pureLabels, sameOwners, linkOwners 中的名字部分)
    // 注意：sameOwners/linkOwners 在解析器中已经是带 .eth 后缀的完整域名
    // 这里我们简单处理，把它们合并并交给 hook (hook 内部会去后缀)
    const allLabels = [
      ...classified.pureLabels,
      ...classified.sameOwners.map((n) => n.replace(".eth", "")),
      ...classified.linkOwners.map((n) => n.replace(".eth", "")),
    ];

    if (allLabels.length === 0) {
      alert("未检测到有效的域名输入");
      return;
    }

    console.log("准备批量续费列表:", allLabels);

    // 调用 hook
    await renewBatch(allLabels, duration);
  };

  // --- 界面渲染 ---

  if (!isConnected) {
    return (
      <div className="p-8 text-center border rounded-xl bg-gray-50">
        <p className="text-gray-500">🔴 请先连接钱包以进行测试</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 border rounded-xl shadow-sm bg-white mt-10">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">🛠️ 续费功能测试台</h2>
        <div className="text-sm">
          状态: <span className={getStatusColor(status)}>{status}</span>
        </div>
      </div>

      {/* 1. 设置区域 */}
      <div className="space-y-3">
        <label className="block text-sm text-gray-700">⚙️ 续费时长设置</label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={duration === DURATION_ONE_YEAR}
              onChange={() => setDuration(DURATION_ONE_YEAR)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>1 年 (标准)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={duration === DURATION_SHORT_TEST}
              onChange={() => setDuration(DURATION_SHORT_TEST)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>28天 + 1小时 (测试)</span>
          </label>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. 单域名续费 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🅰️ 单域名续费 (EthControllerV3)
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={singleLabel}
            onChange={(e) => setSingleLabel(e.target.value)}
            placeholder="输入 Label (例如: alice)"
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={isBusy}
          />
          <button
            onClick={handleSingleSubmit}
            disabled={isBusy || !singleLabel}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBusy ? "处理中..." : "续费单个"}
          </button>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 3. 批量续费 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🅱️ 批量续费 (BulkRenewal)
        </h3>
        <p className="text-xs text-gray-500">
          支持换行、逗号或空格分隔。支持 @name, #name 或纯 label。
        </p>
        <textarea
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
          rows={4}
          placeholder={`alice\nbob\ncharlie, david`}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-sm"
          disabled={isBusy}
        />
        <div className="flex justify-end gap-3">
          {/* 重置状态按钮，方便失败后重试 */}
          {status === "error" && (
            <button
              onClick={resetStatus}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 underline"
            >
              重置状态
            </button>
          )}

          <button
            onClick={handleBatchSubmit}
            disabled={isBusy || !batchInput}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBusy ? "批量处理中..." : "批量续费"}
          </button>
        </div>
      </div>

      {/* 4. 调试信息区域 */}
      <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-auto">
        <p>当前账号: {address}</p>
        <p>选择时长: {duration.toString()} 秒</p>
        <p>当前状态: {status}</p>
      </div>
    </div>
  );
};

// 辅助：状态颜色映射
function getStatusColor(status: string) {
  switch (status) {
    case "idle":
      return "text-gray-400";
    case "loading":
      return "text-blue-500";
    case "processing":
      return "text-orange-500";
    case "success":
      return "text-green-600";
    case "error":
      return "text-red-600";
    default:
      return "text-gray-400";
  }
}
