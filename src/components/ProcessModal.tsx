// src/components/ProcessModal.tsx

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faPlus,
  faMinus,
  faCircleNotch,
  faCheckCircle,
  faExclamationCircle,
  faPersonRunning,
  faExternalLinkAlt,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { useChainId } from "wagmi";
import { DEFAULT_DURATION_SECONDS } from "../config/constants";

// 简单的 Etherscan 链接生成器
const getExplorerLink = (chainId: number, hash: string) => {
  const prefix = chainId === 11155111 ? "sepolia." : ""; // 根据需要适配测试网
  return `https://${prefix}etherscan.io/tx/${hash}`;
};

export type ProcessType = "register" | "renew" | "batch";

interface ProcessModalProps {
  isOpen: boolean;
  type: ProcessType;
  status: string;
  txHash?: string | null;
  secondsLeft?: number;
  onClose: () => void;
  onConfirm: (duration: bigint) => void;
  title: string;
}

export const ProcessModal = ({
  isOpen,
  type,
  status,
  txHash,
  secondsLeft = 0,
  onClose,
  onConfirm,
  title,
}: ProcessModalProps) => {
  const [years, setYears] = useState(1);
  const chainId = useChainId();

  // 状态归类
  const isIdle = status === "idle";
  const isSuccess = status === "success";
  const isError = status === "error";
  const isProcessing = !isIdle && !isSuccess && !isError;

  // 注册流程的特殊状态判断
  const isWaitingWallet =
    status === "loading" || status === "registering" || status === "committing";

  // 自动关闭逻辑：仅在 Idle 状态下允许点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isIdle) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm(BigInt(years) * DEFAULT_DURATION_SECONDS);
  };

  if (!isOpen) return null;

  // 渲染内容：设置时长 (Step 1)
  const renderSettings = () => (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 mb-8">
        <button
          onClick={() => setYears(Math.max(1, years - 1))}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm text-link hover:bg-link hover:text-white transition-all active:scale-90"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>

        <div className="text-center">
          <span className="text-4xl font-qs-bold text-text-main">{years}</span>
          <span className="ml-2 text-gray-500 font-qs-medium">年</span>
        </div>

        <button
          onClick={() => setYears(Math.min(10, years + 1))}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm text-link hover:bg-link hover:text-white transition-all active:scale-90"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-xl font-qs-semibold text-gray-500 hover:bg-gray-100 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-3.5 rounded-xl font-qs-semibold bg-link text-white hover:bg-link-hover shadow-lg shadow-link/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {type === "register" ? "开始注册" : "确认续费"}
        </button>
      </div>
    </div>
  );

  // 渲染内容：处理中 (Step 2)
  const renderProcessing = () => {
    let message = "正在处理...";
    let subMessage = "请在钱包中确认交易";
    let showTimer = false;

    // 根据详细状态定制文案
    if (status === "committing") {
      message = "提交 Commit 请求";
      subMessage = "这是注册的第一步，防止域名被抢注";
    } else if (status === "waiting_commit") {
      message = "等待 Commit 上链";
      subMessage = "交易已发出，等待区块链确认...";
    } else if (status === "counting_down") {
      message = "等待冷却期";
      subMessage = "为了安全，以太坊网络要求等待 60 秒...";
      showTimer = true;
    } else if (status === "registering") {
      message = "最终注册";
      subMessage = "冷却结束，正在发起最终注册交易";
    } else if (status === "waiting_register") {
      message = "等待注册确认";
      subMessage = "马上就好，您的域名即将到手！";
    } else if (status === "loading") {
      message = "等待钱包签名";
      subMessage = "请打开钱包插件进行确认";
    } else if (status === "processing") {
      message = "交易处理中";
      subMessage = "交易已广播，等待节点确认...";
    }

    return (
      <div className="text-center py-6 animate-in zoom-in-95 duration-300">
        <div className="relative inline-block mb-6">
          {/* 动态图标 */}
          {showTimer ? (
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-2xl font-bold border-4 border-orange-100">
              {secondsLeft}s
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-link/20 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-20 h-20 bg-link/10 rounded-full flex items-center justify-center text-link text-3xl">
                {isWaitingWallet ? (
                  <FontAwesomeIcon icon={faWallet} className="animate-pulse" />
                ) : (
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                )}
              </div>
            </>
          )}
        </div>

        <h3 className="text-xl font-qs-bold text-gray-800 mb-2">{message}</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-[80%] mx-auto">
          {subMessage}
        </p>

        {/* 交易哈希链接 */}
        {txHash && (
          <a
            href={getExplorerLink(chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 hover:text-link hover:bg-blue-50 transition-colors border border-gray-100"
          >
            <span>
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </span>
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </a>
        )}
      </div>
    );
  };

  // 渲染内容：成功 (Step 3)
  const renderSuccess = () => (
    <div className="text-center py-6 animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-4xl mx-auto mb-6">
        <FontAwesomeIcon icon={faCheckCircle} />
      </div>
      <h3 className="text-2xl font-qs-bold text-gray-800 mb-2">
        {type === "register" ? "注册成功！" : "续费成功！"}
      </h3>
      <p className="text-gray-500 mb-8">
        您的操作已在链上确认，元数据更新可能需要几分钟。
      </p>
      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-xl font-qs-semibold bg-gray-900 text-white hover:bg-black transition-all active:scale-95"
      >
        完成
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50 relative">
        {/* 顶部标题栏 */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <h3 className="text-lg font-qs-bold text-gray-800 flex items-center gap-2">
            {!isProcessing && !isSuccess && (
              <FontAwesomeIcon icon={faCalendarAlt} className="text-link" />
            )}
            {isProcessing ? "操作进行中" : isSuccess ? "操作完成" : title}
          </h3>
          {/* 仅在非处理状态下显示关闭按钮 */}
          {isIdle && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-6 pt-2">
          {isIdle && renderSettings()}
          {isProcessing && renderProcessing()}
          {isSuccess && renderSuccess()}
          {isError && (
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-4">
                <FontAwesomeIcon icon={faExclamationCircle} />
              </div>
              <p className="text-gray-800 font-bold mb-2">操作失败</p>
              <p className="text-sm text-gray-500 mb-6">
                请检查网络连接或拒绝原因
              </p>
              <button onClick={onClose} className="text-link hover:underline">
                关闭并重试
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
