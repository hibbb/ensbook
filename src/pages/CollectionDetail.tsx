// src/pages/CollectionDetail.tsx

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query"; // 🚀 1. 引入 QueryClient
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableLogic } from "../components/NameTable/useNameTableLogic";
import { ProcessModal, type ProcessType } from "../components/ProcessModal"; // 🚀 引入流程组件

// Hooks & Services
import { useCollectionRecords } from "../hooks/useEnsData";
import { usePrimaryNames } from "../hooks/usePrimaryNames";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { useEnsRegistration } from "../hooks/useEnsRegistration"; // 🚀 引入注册 Hook
import { getAllPendingLabels } from "../services/storage/registration"; // 🚀 引入断点续传检查

// Config & Utils
import { ENS_COLLECTIONS } from "../config/collections";
import { isRenewable } from "../utils/ens";
import type { NameRecord } from "../types/ensNames";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  // ==========================================================================
  // 1. 数据获取
  // ==========================================================================
  const {
    data: basicRecords,
    isLoading,
    isError,
  } = useCollectionRecords(id || "");

  // 补全主域名信息
  const records = usePrimaryNames(basicRecords);

  // 表格逻辑 (包含筛选、排序、选择)
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
    // 🚀 新增：解构出计数统计
    statusCounts,
    actionCounts,
  } = useNameTableLogic(records, address);

  // ==========================================================================
  // 2. 区块链交互 Hooks
  // ==========================================================================

  // 续费 Hook
  const {
    renewSingle,
    renewBatch,
    status: renewalStatus,
    txHash: renewalTxHash,
    resetStatus: resetRenewal,
    isBusy: isRenewalBusy,
  } = useEnsRenewal();

  // 注册 Hook (🚀 新增支持)
  const {
    startRegistration,
    checkAndResume,
    status: regStatus,
    secondsLeft,
    currentHash: regTxHash,
    resetStatus: resetReg,
  } = useEnsRegistration();

  // ==========================================================================
  // 3. 状态管理
  // ==========================================================================

  // 流程控制：当前操作目标
  const [durationTarget, setDurationTarget] = useState<{
    type: ProcessType;
    record?: NameRecord;
    labels?: string[];
  } | null>(null);

  // 断点续传状态
  const [pendingLabels, setPendingLabels] = useState<Set<string>>(new Set());

  // 🚀 最终修复：
  // 1. 移除 basicRecords 依赖：挂起任务是全局的，不需要依赖当前页面数据。
  // 2. 使用 setTimeout (0ms)：将 setState 推迟到渲染完成后执行。
  //    这能彻底消除 "Calling setState synchronously within an effect" 错误。
  useEffect(() => {
    const timer = setTimeout(() => {
      setPendingLabels(getAllPendingLabels());
    }, 0);
    return () => clearTimeout(timer);
  }, [regStatus]); // 仅监听注册状态变化

  // 🚀 核心优化：监听交易成功，触发数据刷新
  // 集合页面通常需要更及时的反馈，因此采用与 Home 相同的双重刷新策略
  useEffect(() => {
    if (regStatus === "success" || renewalStatus === "success") {
      const timer = setTimeout(() => {
        // 刷新集合记录
        queryClient.invalidateQueries({ queryKey: ["collection-records"] });
        // 同时刷新通用的名称记录，保证数据一致性
        queryClient.invalidateQueries({ queryKey: ["name-records"] });
      }, 2000);

      const deepTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["collection-records"] });
        queryClient.invalidateQueries({ queryKey: ["name-records"] });
      }, 10000);

      return () => {
        clearTimeout(timer);
        clearTimeout(deepTimer);
      };
    }
  }, [regStatus, renewalStatus, queryClient]);

  // ==========================================================================
  // 4. 业务逻辑处理
  // ==========================================================================

  // 计算可续费的选择项
  const renewableLabelSet = useMemo(() => {
    if (!processedRecords) return new Set<string>();
    return new Set(
      processedRecords.filter((r) => isRenewable(r.status)).map((r) => r.label),
    );
  }, [processedRecords]);

  const validSelection = useMemo(() => {
    if (selectedLabels.size === 0) return [];
    return Array.from(selectedLabels).filter((label) =>
      renewableLabelSet.has(label),
    );
  }, [selectedLabels, renewableLabelSet]);

  const selectionCount = validSelection.length;

  // --- 触发器 ---

  // 单个注册
  const handleSingleRegister = async (record: NameRecord) => {
    if (pendingLabels.has(record.label)) {
      // 断点续传：直接进入处理流程
      setDurationTarget({ type: "register", record });
      await checkAndResume(record.label);
    } else {
      // 新注册：打开时长选择
      setDurationTarget({ type: "register", record });
    }
  };

  // 单个续费
  const handleSingleRenew = (record: NameRecord) => {
    setDurationTarget({ type: "renew", record });
  };

  // 批量续费
  const handleBatchRenewalTrigger = () => {
    if (selectionCount === 0) return;
    setDurationTarget({ type: "batch", labels: validSelection });
  };

  // --- 确认回调 ---
  const onDurationConfirm = (duration: bigint) => {
    if (!durationTarget) return;

    if (durationTarget.type === "register" && durationTarget.record) {
      startRegistration(durationTarget.record.label, duration);
    } else if (durationTarget.type === "renew" && durationTarget.record) {
      renewSingle(durationTarget.record.label, duration);
    } else if (durationTarget.type === "batch" && durationTarget.labels) {
      renewBatch(durationTarget.labels, duration);
    }
  };

  // --- 关闭回调 ---
  const handleCloseModal = () => {
    setDurationTarget(null);
    resetRenewal();
    resetReg();
  };

  // 计算 Modal 动态状态
  const activeType = durationTarget?.type || "renew";
  const activeStatus = activeType === "register" ? regStatus : renewalStatus;
  const activeTxHash = activeType === "register" ? regTxHash : renewalTxHash;

  // ==========================================================================
  // 5. 渲染
  // ==========================================================================

  if (!collection) return <div className="p-20 text-center">集合未找到</div>;
  if (isError)
    return <div className="p-20 text-center text-red-500">加载失败</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pb-24 relative">
      <header className="mb-10">
        <h1 className="text-4xl font-qs-semibold">{collection.displayName}</h1>
        <p className="text-gray-400 mt-2">{collection.description}</p>
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
        canDelete={false} // 集合页面通常不支持删除列表项
        selectedLabels={selectedLabels}
        onToggleSelection={toggleSelection}
        onToggleSelectAll={toggleSelectAll}
        // 🚀 传递功能回调
        onRegister={handleSingleRegister}
        onRenew={handleSingleRenew}
        // 🚀 传递断点续传状态
        pendingLabels={pendingLabels}
        // 🚀 传入未经过滤的原始总数
        totalRecordsCount={records?.length || 0}
        // 🚀 新增：透传计数数据
        statusCounts={statusCounts}
        actionCounts={actionCounts}
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

            {/* 🚀 升级：改为触发 Modal */}
            <button
              onClick={handleBatchRenewalTrigger}
              disabled={isRenewalBusy || !isConnected}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-qs-semibold transition-all shadow-sm ${
                isRenewalBusy || !isConnected
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-link text-white hover:bg-link-hover hover:shadow-md active:scale-95"
              }`}
            >
              <FontAwesomeIcon icon={faRotate} spin={isRenewalBusy} />
              批量续费
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

      {/* 🚀 流程模态框 */}
      <ProcessModal
        isOpen={!!durationTarget}
        type={activeType}
        status={activeStatus}
        txHash={activeTxHash}
        secondsLeft={secondsLeft}
        title={
          activeType === "register"
            ? "设置注册时长"
            : activeType === "batch"
              ? `批量续费 (${durationTarget?.labels?.length}个)`
              : "设置续费时长"
        }
        onClose={handleCloseModal}
        onConfirm={onDurationConfirm}
      />
    </div>
  );
};
