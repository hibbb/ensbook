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
  faExternalLinkAlt,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { useChainId } from "wagmi";
import { BaseModal } from "./ui/BaseModal"; // 🚀 引入 BaseModal
import { DEFAULT_DURATION_SECONDS } from "../config/constants";

const getExplorerLink = (chainId: number, hash: string) => {
  const prefix = chainId === 11155111 ? "sepolia." : "";
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
  const isWaitingWallet =
    status === "loading" || status === "registering" || status === "committing";

  // 🚀 安全关闭逻辑：只有在 idle 状态下才允许通过背景/ESC 关闭
  // (处理中或成功/失败状态下，需要用户点击特定按钮或完成按钮)
  const handleSafeClose = () => {
    if (isIdle) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm(BigInt(years) * DEFAULT_DURATION_SECONDS);
  };

  // 渲染内容：设置时长 (Step 1)
  const renderSettings = () => (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 mb-6 shadow-sm">
        <button
          onClick={() => setYears(Math.max(1, years - 1))}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-link hover:text-white transition-all active:scale-90"
        >
          <FontAwesomeIcon icon={faMinus} size="sm" />
        </button>

        <div className="text-center">
          <span className="text-3xl font-qs-semibold text-text-main">
            {years}
          </span>
          <span className="ml-2 text-gray-400 font-qs-medium text-sm">年</span>
        </div>

        <button
          onClick={() => setYears(Math.min(10, years + 1))}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-link hover:text-white transition-all active:scale-90"
        >
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-lg font-qs-semibold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-3 rounded-lg font-qs-semibold text-sm bg-link text-white hover:bg-link-hover shadow-lg shadow-link/20 transition-all active:scale-95 flex items-center justify-center gap-2"
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
          {showTimer ? (
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xl font-bold border-2 border-orange-100">
              {secondsLeft}s
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-link/20 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-16 h-16 bg-link/10 rounded-full flex items-center justify-center text-link text-2xl">
                {isWaitingWallet ? (
                  <FontAwesomeIcon icon={faWallet} className="animate-pulse" />
                ) : (
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                )}
              </div>
            </>
          )}
        </div>

        <h3 className="text-lg font-qs-semibold text-text-main mb-1">
          {message}
        </h3>
        <p className="text-xs text-gray-500 mb-6 max-w-[85%] mx-auto">
          {subMessage}
        </p>

        {txHash && (
          <a
            href={getExplorerLink(chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md text-xs text-link hover:text-link-hover hover:bg-gray-100 transition-colors border border-gray-100"
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
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-3xl mx-auto mb-4 border border-green-100">
        <FontAwesomeIcon icon={faCheckCircle} />
      </div>
      <h3 className="text-xl font-qs-semibold text-text-main mb-2">
        {type === "register" ? "注册成功！" : "续费成功！"}
      </h3>
      <p className="text-sm text-gray-500 mb-6 px-4">
        您的操作已在链上确认，数据更新可能需要几分钟。
      </p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-lg font-qs-semibold text-sm bg-link text-white hover:bg-link-hover transition-all active:scale-95 shadow-lg shadow-link/20"
      >
        完成
      </button>
    </div>
  );

  // 🚀 使用 BaseModal 包裹
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleSafeClose} // 仅在 idle 时响应关闭
      maxWidth="max-w-sm"
      // 动态标题逻辑
      title={
        <div className="flex items-center gap-2">
          {!isProcessing && !isSuccess && (
            <FontAwesomeIcon icon={faCalendarAlt} className="text-link" />
          )}
          <span>
            {isProcessing ? "操作进行中" : isSuccess ? "操作完成" : title}
          </span>
        </div>
      }
      showCloseButton={isIdle} // 处理中不显示关闭按钮
    >
      <div className="p-6">
        {isIdle && renderSettings()}
        {isProcessing && renderProcessing()}
        {isSuccess && renderSuccess()}
        {isError && (
          <div className="text-center py-4">
            <div className="text-red-500 text-3xl mb-3">
              <FontAwesomeIcon icon={faExclamationCircle} />
            </div>
            <p className="text-text-main font-bold mb-1">操作失败</p>
            <p className="text-xs text-gray-500 mb-6">
              请检查网络连接或拒绝原因
            </p>
            <button
              onClick={onClose}
              className="text-link text-sm font-qs-semibold hover:underline"
            >
              关闭并重试
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  );
};
