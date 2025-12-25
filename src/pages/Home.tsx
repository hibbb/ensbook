import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query"; //
import { parseAndClassifyInputs } from "../utils/parseInputs"; //
import { fetchLabels } from "../services/graph/fetchLabels"; //
import { useNameRecords } from "../hooks/useEnsData"; //
import { isRenewable } from "../utils/ens"; //
import { getStoredLabels, saveStoredLabels } from "../services/storage/labels"; //
import type { NameRecord } from "../types/ensNames"; //

export const Home = () => {
  const queryClient = useQueryClient();

  // 1. 核心状态：使用延迟初始化确保同步加载本地存储
  const [resolvedLabels, setResolvedLabels] = useState<string[]>(() =>
    getStoredLabels(),
  );

  // 2. 持久化：当 labels 列表变化时同步写入
  useEffect(() => {
    saveStoredLabels(resolvedLabels);
  }, [resolvedLabels]);

  const [inputValue, setInputValue] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // 3. 数据钩子：基于当前完整列表获取链上详情
  const { data: records, isLoading: isQuerying } =
    useNameRecords(resolvedLabels);

  // 4. 核心修复：白名单过滤，彻底杜绝缓存“诈尸”现象
  const validRecords = useMemo(() => {
    if (!records || resolvedLabels.length === 0) return [];
    const labelSet = new Set(resolvedLabels);
    // 仅保留存在于当前 labels 列表中的记录
    return records.filter((r) => labelSet.has(r.label));
  }, [records, resolvedLabels]);

  // 5. 统计逻辑：计算当前列表中各状态的数量
  const stats = useMemo(() => {
    const counts = {
      Available: 0,
      Active: 0,
      Grace: 0,
      Premium: 0,
    };
    validRecords.forEach((r) => {
      if (r.status in counts) counts[r.status as keyof typeof counts]++;
    });
    return counts;
  }, [validRecords]);

  // 处理提交：增量追加逻辑
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      setIsResolving(true);
      const classified = parseAndClassifyInputs(inputValue); //
      const newLabels = await fetchLabels(classified); //

      if (newLabels.length > 0) {
        setResolvedLabels((prev) => {
          // 追加并去重，保留原有顺序
          const merged = new Set([...prev, ...newLabels]);
          return Array.from(merged);
        });
        setInputValue(""); // 提交后清空输入框
      }
    } catch (error) {
      console.error("解析出错:", error);
    } finally {
      setIsResolving(false);
    }
  };

  // 个体删除逻辑
  const handleDelete = (label: string) => {
    setResolvedLabels((prev) => prev.filter((l) => l !== label));
  };

  // 完整清空逻辑
  const handleClearAll = () => {
    if (window.confirm("确定要清空所有记录吗？")) {
      setResolvedLabels([]);
      queryClient.removeQueries({ queryKey: ["name-records"] });
    }
  };

  const isLoading = isResolving || isQuerying;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 搜索区域 */}
      <section className="mb-8">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center shadow-sm"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入标签、@地址 或 #解析记录 追加查询..."
            className="flex-1 block w-full h-14 pl-6 pr-4 rounded-l-2xl border border-gray-200 border-r-0 bg-white text-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="h-14 px-10 rounded-r-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center justify-center min-w-[120px]"
          >
            {isResolving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "追加查询"
            )}
          </button>
        </form>

        {/* 统计与清空工具栏 */}
        <div className="mt-6 flex flex-wrap justify-between items-center gap-4 px-2">
          <div className="flex flex-wrap gap-2">
            <StatBadge
              label="全部"
              count={resolvedLabels.length}
              color="bg-gray-100 text-text-main"
            />
            <StatBadge
              label="可注册"
              count={stats.Available + stats.Premium}
              color="bg-green-100 text-green-600"
            />
            <StatBadge
              label="宽限期"
              count={stats.Grace}
              color="bg-orange-100 text-orange-600"
            />
            <StatBadge
              label="已占用"
              count={stats.Active}
              color="bg-blue-100 text-blue-600"
            />
          </div>

          {resolvedLabels.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              清空全部历史
            </button>
          )}
        </div>
      </section>

      {/* 结果网格 */}
      <section className="pb-20">
        {isLoading && resolvedLabels.length > 0 && (
          <div className="mb-4 text-center text-xs text-blue-500 animate-pulse">
            正在同步最新链上状态...
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 倒序排列：最新的查询显示在最前 */}
          {validRecords
            .slice()
            .reverse()
            .map((record) => (
              <StatusCard
                key={record.namehash}
                record={record}
                onDelete={() => handleDelete(record.label)}
              />
            ))}
        </div>

        {resolvedLabels.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-3xl text-gray-300">
            暂无解析记录，请在上方输入开始
          </div>
        )}
      </section>
    </div>
  );
};

// 内部组件：统计标签
const StatBadge = ({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) => (
  <div
    className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-2 ${color}`}
  >
    <span>{label}</span>
    <span className="opacity-60">{count}</span>
  </div>
);

// 内部组件：域名状态卡片
const StatusCard = ({
  record,
  onDelete,
}: {
  record: NameRecord;
  onDelete: () => void;
}) => {
  const renewable = isRenewable(record.status); //

  return (
    <div className="group relative flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
      {/* 删除按钮：仅在悬停时显示 */}
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-100 rounded-full shadow-sm text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center z-10"
      >
        ×
      </button>

      <div className="truncate mr-4">
        <div className="font-bold text-gray-800 truncate flex items-center gap-0.5">
          <span className="truncate">{record.label}</span>
          <span className="text-gray-300 font-normal">.eth</span>
        </div>
        <div
          className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${
            record.status === "Available"
              ? "text-green-500"
              : record.status === "Active"
                ? "text-blue-500"
                : "text-orange-500"
          }`}
        >
          {record.status}
        </div>
      </div>

      <button
        className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
          renewable
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-100"
            : "bg-white border border-green-500 text-green-600 hover:bg-green-50"
        }`}
      >
        {renewable ? "续费" : "注册"}
      </button>
    </div>
  );
};
