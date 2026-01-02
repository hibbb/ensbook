// src/pages/Home.tsx

import { useState, useEffect, useMemo, useRef } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

// Components
import { NameTable } from "../components/NameTable";
import { useNameTableLogic } from "../components/NameTable/useNameTableLogic";
import { SearchHelpModal } from "../components/SearchHelpModal";
import { ProcessModal, type ProcessType } from "../components/ProcessModal";
import { HomeSearchSection } from "./Home/HomeSearchSection";
import { HomeFloatingBar } from "./Home/HomeFloatingBar";

// Hooks & Services
import { useNameRecords } from "../hooks/useEnsData";
import { usePrimaryNames } from "../hooks/usePrimaryNames";
import { useEnsRenewal } from "../hooks/useEnsRenewal";
import { useEnsRegistration } from "../hooks/useEnsRegistration";
import { parseAndClassifyInputs } from "../utils/parseInputs";
import { fetchLabels } from "../services/graph/fetchLabels";
import { getStoredLabels, saveStoredLabels } from "../services/storage/labels";
import { getAllPendingLabels } from "../services/storage/registration";

// Types
import type { NameRecord } from "../types/ensNames";
import type { DeleteCriteria } from "../components/NameTable/types";

export const Home = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  // ==========================================================================
  // 1. 本地状态与存储
  // ==========================================================================
  const [resolvedLabels, setResolvedLabels] = useState<string[]>(() =>
    getStoredLabels(),
  );
  const [inputValue, setInputValue] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // 流程控制状态：当前正在操作的目标（注册/续费/批量）
  const [durationTarget, setDurationTarget] = useState<{
    type: ProcessType;
    record?: NameRecord;
    labels?: string[];
  } | null>(null);

  useEffect(() => {
    saveStoredLabels(resolvedLabels);
  }, [resolvedLabels]);

  // ==========================================================================
  // 2. 数据获取与处理
  // ==========================================================================
  const { data: records, isLoading: isQuerying } =
    useNameRecords(resolvedLabels);

  // 🚀 优化：防止删除时的骨架屏闪烁 (Keep Previous Data)
  const previousRecordsRef = useRef<NameRecord[]>([]);
  useEffect(() => {
    if (records) {
      previousRecordsRef.current = records;
    }
  }, [records]);

  const effectiveRecords = records || previousRecordsRef.current;

  // 客户端过滤：确保列表立即响应删除操作
  const validRecords = useMemo(() => {
    if (!effectiveRecords || resolvedLabels.length === 0) return [];
    const currentLabelSet = new Set(resolvedLabels);
    return effectiveRecords.filter((r) => currentLabelSet.has(r.label));
  }, [effectiveRecords, resolvedLabels]);

  // 补全主域名信息
  const enrichedRecords = usePrimaryNames(validRecords);

  // 表格逻辑 Hook (排序、过滤、多选)
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
    nameCounts, // 🚀 从 hook 解构
  } = useNameTableLogic(enrichedRecords, address);

  // ==========================================================================
  // 3. 区块链交互 Hooks
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

  // 注册 Hook
  const {
    startRegistration,
    checkAndResume,
    status: regStatus,
    secondsLeft,
    currentHash: regTxHash,
    resetStatus: resetReg,
  } = useEnsRegistration();

  // 🚀 1. 管理挂起任务的状态
  const [pendingLabels, setPendingLabels] = useState<Set<string>>(new Set());

  // 🚀 2. 初始化和列表变化时，扫描本地存储
  useEffect(() => {
    setPendingLabels(getAllPendingLabels());
  }, [resolvedLabels, regStatus]);

  const hasContent = resolvedLabels.length > 0;

  // ==========================================================================
  // 4. 事件处理函数
  // ==========================================================================

  // --- 搜索与添加 ---
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setIsResolving(true);
    try {
      const classified = parseAndClassifyInputs(inputValue);
      const fetchedLabels = await fetchLabels(classified);

      if (fetchedLabels.length > 0) {
        const currentSet = new Set(resolvedLabels);
        const newUniqueLabels = fetchedLabels.filter((l) => !currentSet.has(l));

        if (newUniqueLabels.length === 0) {
          toast("所有域名已存在列表中", { icon: "👌" });
        } else {
          setResolvedLabels((prev) => [...prev, ...newUniqueLabels]);
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

  // --- 删除操作 ---
  const handleDelete = (record: NameRecord) => {
    setResolvedLabels((prev) => prev.filter((l) => l !== record.label));
    if (selectedLabels.has(record.label)) {
      toggleSelection(record.label);
    }
  };

  // 🚀 重构删除逻辑：仅 "all" 类型需要确认
  const handleBatchDelete = (criteria: DeleteCriteria) => {
    // 使用 effectiveRecords 确保在快速操作或数据刷新瞬间也有数据可用
    const targetRecords = records || effectiveRecords;
    if (!targetRecords) return;

    const { type, value } = criteria;

    // 1. 全部删除 (保持确认弹窗，这是破坏性最大的操作)
    if (type === "all") {
      if (window.confirm("确定要清空所有历史记录吗？")) {
        setResolvedLabels([]);
        clearSelection();
      }
      return;
    }

    let labelsToDelete = new Set<string>();

    // 2. 根据类型筛选要删除的记录
    switch (type) {
      case "status":
        labelsToDelete = new Set(
          targetRecords.filter((r) => r.status === value).map((r) => r.label),
        );
        break;

      case "length":
        labelsToDelete = new Set(
          targetRecords
            .filter((r) => r.label.length === value)
            .map((r) => r.label),
        );
        break;

      case "wrapped": {
        const isWrapped = value as boolean;
        labelsToDelete = new Set(
          targetRecords
            .filter((r) => r.wrapped === isWrapped)
            .map((r) => r.label),
        );
        break;
      }

      // 🚀 新增：处理按所有者删除
      case "owner": {
        if (!address) {
          toast.error("请先连接钱包以识别所有权");
          return;
        }
        const isDeletingMine = value === "mine";
        labelsToDelete = new Set(
          targetRecords
            .filter((r) => {
              const recordOwner = r.owner?.toLowerCase();
              const myAddress = address.toLowerCase();
              const isOwner = recordOwner === myAddress;
              // 如果要删我的：保留 isOwner 为 true 的
              // 如果要删其他的：保留 isOwner 为 false 的
              return isDeletingMine ? isOwner : !isOwner;
            })
            .map((r) => r.label),
        );
        break;
      }
    }

    if (labelsToDelete.size === 0) return;

    // 3. 直接执行删除 (移除 window.confirm 包裹)
    setResolvedLabels((prev) =>
      prev.filter((label) => !labelsToDelete.has(label)),
    );

    // 同步清理选中状态
    if (selectedLabels.size > 0) {
      labelsToDelete.forEach((label) => {
        if (selectedLabels.has(label)) {
          toggleSelection(label);
        }
      });
    }
    toast.success("删除成功");
  };

  // --- 流程触发 (打开 Modal) ---
  const handleSingleRegister = async (record: NameRecord) => {
    if (pendingLabels.has(record.label)) {
      setDurationTarget({ type: "register", record });
      await checkAndResume(record.label);
    } else {
      setDurationTarget({ type: "register", record });
    }
  };

  const handleSingleRenew = (record: NameRecord) => {
    setDurationTarget({ type: "renew", record });
  };

  const handleBatchRenewalTrigger = () => {
    if (selectedLabels.size === 0) return;
    setDurationTarget({ type: "batch", labels: Array.from(selectedLabels) });
  };

  // --- 流程确认 (Modal 回调) ---
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

  // --- 流程关闭与清理 ---
  const handleCloseModal = () => {
    setDurationTarget(null);
    resetRenewal();
    resetReg();
  };

  // 🚀 2. 监听交易成功，触发数据刷新
  useEffect(() => {
    if (regStatus === "success" || renewalStatus === "success") {
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["name-records"] });
      }, 2000);

      const deepTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["name-records"] });
      }, 10000);

      return () => {
        clearTimeout(timer);
        clearTimeout(deepTimer);
      };
    }
  }, [regStatus, renewalStatus, queryClient]);

  // 计算 Modal 需要的动态状态
  const activeType = durationTarget?.type || "renew";
  const activeStatus = activeType === "register" ? regStatus : renewalStatus;
  const activeTxHash = activeType === "register" ? regTxHash : renewalTxHash;

  // 骨架屏显示逻辑
  const showSkeleton =
    isQuerying && resolvedLabels.length > 0 && validRecords.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 relative min-h-[85vh] flex flex-col">
      {/* ================= Header & Search ================= */}
      <HomeSearchSection
        hasContent={hasContent}
        inputValue={inputValue}
        isResolving={isResolving}
        onInputChange={setInputValue}
        onSubmit={() => handleSubmit()}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* ================= Main Table ================= */}
      {hasContent && (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards pb-20">
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
            onBatchDelete={handleBatchDelete}
            selectedLabels={selectedLabels}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={toggleSelectAll}
            pendingLabels={pendingLabels}
            onRegister={handleSingleRegister}
            onRenew={handleSingleRenew}
            skeletonRows={5}
            headerTop="88px"
            totalRecordsCount={enrichedRecords?.length || 0}
            statusCounts={statusCounts}
            actionCounts={actionCounts}
            nameCounts={nameCounts}
          />
        </div>
      )}

      {/* ================= Bottom Floating Bar ================= */}
      <HomeFloatingBar
        selectedCount={selectedLabels.size}
        isBusy={isRenewalBusy}
        isConnected={isConnected}
        onBatchRenew={handleBatchRenewalTrigger}
        onClearSelection={clearSelection}
      />

      {/* ================= Modals ================= */}
      <SearchHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

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
