// src/components/ProcessModal/StatusViews.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faCircleNotch,
  faExternalLinkAlt,
  faCheckCircle,
  faExclamationCircle,
  faMinimize,
  faTrashCan,
  faRocket, // 假设有这个图标，或者用 faCheck
  faArrowRight, // 🚀 用这个做注册按钮
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { truncateAddress } from "../../utils/format";

interface ProcessingViewProps {
  status: string;
  secondsLeft: number;
  txHash?: string | null;
  onClose: () => void;
  onAbort?: () => void;
  onConfirmRegistration?: () => void; // 🚀 新增
}

export const ProcessingView = ({
  status,
  secondsLeft,
  txHash,
  onClose,
  onAbort,
  onConfirmRegistration,
}: ProcessingViewProps) => {
  const { t } = useTranslation();

  let message = t("transaction.status.processing");
  let subMessage = t("transaction.status.confirm_wallet");
  let showTimer = false;
  let showRegisterBtn = false; // 🚀

  const isWaitingWallet = ["loading", "registering", "committing"].includes(
    status,
  );

  // ... (中间的 message 判断逻辑保持不变，请保留原代码) ...
  if (status === "committing") {
    message = t("transaction.step.commit_title");
    subMessage = t("transaction.step.commit_desc");
  } else if (status === "waiting_commit") {
    message = t("transaction.step.wait_commit_title");
    subMessage = t("transaction.step.wait_commit_desc");
  } else if (status === "counting_down") {
    message = t("transaction.step.cooldown_title");
    subMessage = t("transaction.step.cooldown_desc");
    showTimer = true;
  } else if (status === "ready") {
    // 🚀 新增状态处理
    message = t("transaction.step.register_title"); // "Final Registration"
    subMessage = t("transaction.step.register_desc"); // "Cooldown over..."
    showRegisterBtn = true;
  } else if (status === "registering") {
    message = t("transaction.step.register_title");
    subMessage = t("transaction.step.register_desc");
  } else if (status === "waiting_register") {
    message = t("transaction.step.wait_register_title");
    subMessage = t("transaction.step.wait_register_desc");
  } else if (status === "loading") {
    message = t("transaction.step.loading_title");
    subMessage = t("transaction.step.loading_desc");
  } else if (status === "processing") {
    message = t("transaction.step.processing_title");
    subMessage = t("transaction.step.processing_desc");
  }

  return (
    <div className="text-center py-6 animate-in zoom-in-95 duration-300">
      <div className="relative inline-block mb-6">
        {showTimer ? (
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xl font-semibold border-2 border-orange-100">
            {secondsLeft}s
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-link/20 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-16 h-16 bg-link/10 rounded-full flex items-center justify-center text-link text-2xl">
              {isWaitingWallet ? (
                <FontAwesomeIcon icon={faWallet} className="animate-pulse" />
              ) : showRegisterBtn ? (
                <FontAwesomeIcon icon={faRocket} /> // 冷却结束，显示火箭图标
              ) : (
                <FontAwesomeIcon icon={faCircleNotch} spin />
              )}
            </div>
          </>
        )}
      </div>
      <h3 className="text-lg font-sans font-semibold text-text-main mb-1">
        {message}
      </h3>
      <p className="text-xs text-gray-500 mb-6 max-w-[85%] mx-auto">
        {subMessage}
      </p>

      {/* 🚀 核心：注册按钮 */}
      {showRegisterBtn && onConfirmRegistration && (
        <button
          onClick={onConfirmRegistration}
          className="w-full py-3 mb-4 rounded-lg font-qs-semibold text-sm bg-link text-white hover:bg-link-hover transition-all active:scale-95 shadow-lg shadow-link/20 flex items-center justify-center gap-2"
        >
          {t("transaction.btn.start_register")}{" "}
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}

      <div className="flex flex-col gap-3 items-center">
        {txHash && (
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md text-xs font-mono text-link hover:text-link-hover hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <span>{truncateAddress(txHash, 10, 8)}</span>
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </a>
        )}

        {/* 后台运行按钮 */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xs font-sans font-medium flex items-center gap-1.5 transition-colors mt-2"
        >
          <FontAwesomeIcon icon={faMinimize} />
          {t("common.run_in_background")}
        </button>

        {/* 🚀 放弃任务按钮 (仅当 onAbort 存在时显示) */}
        {onAbort && (
          <button
            onClick={() => {
              if (window.confirm(t("transaction.confirm.abort"))) {
                onAbort();
              }
            }}
            className="text-red-300 hover:text-red-500 text-xs font-qs-medium flex items-center gap-1.5 transition-colors"
            title="Clear local progress and start over"
          >
            <FontAwesomeIcon icon={faTrashCan} />
            {t("common.abort")}
          </button>
        )}
      </div>
    </div>
  );
};

// ... (SuccessView 和 ErrorView 保持不变) ...
export const SuccessView = ({
  type,
  onClose,
}: {
  type: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-6 animate-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-3xl mx-auto mb-4 border border-green-100">
        <FontAwesomeIcon icon={faCheckCircle} />
      </div>
      <h3 className="text-xl font-sans font-semibold text-text-main mb-2">
        {type === "register"
          ? t("transaction.result.success_register")
          : t("transaction.result.success_renew")}
      </h3>
      <p className="text-sm text-gray-500 mb-6 px-4">
        {t("transaction.result.success_desc")}
      </p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-lg font-sans font-semibold text-sm bg-link text-white hover:bg-link-hover transition-all active:scale-95 shadow-lg shadow-link/20"
      >
        {t("common.finish")}
      </button>
    </div>
  );
};

export const ErrorView = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-4">
      <div className="text-red-500 text-3xl mb-3">
        <FontAwesomeIcon icon={faExclamationCircle} />
      </div>
      <p className="text-text-main font-semibold mb-1">
        {t("transaction.result.error_title")}
      </p>
      <p className="text-xs text-gray-500 mb-6">
        {t("transaction.result.error_desc")}
      </p>
      <button
        onClick={onClose}
        className="text-link text-sm font-sans font-semibold hover:underline"
      >
        {t("common.retry")}
      </button>
    </div>
  );
};
