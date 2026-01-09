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
import { useTranslation } from "react-i18next";
import { BaseModal } from "./ui/BaseModal";
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
  const { t } = useTranslation();

  const isIdle = status === "idle";
  const isSuccess = status === "success";
  const isError = status === "error";
  const isProcessing = !isIdle && !isSuccess && !isError;
  const isWaitingWallet =
    status === "loading" || status === "registering" || status === "committing";

  const handleSafeClose = () => {
    if (isIdle) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm(BigInt(years) * BigInt(DEFAULT_DURATION_SECONDS));
  };

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
          <span className="text-3xl font-qs-medium text-text-main">
            {years}
          </span>
          <span className="ml-2 text-gray-400 font-qs-medium text-sm">
            {/* 🚀 替换: process.year -> common.year */}
            {t("common.year")}
          </span>
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
          className="flex-1 py-3 rounded-lg font-qs-medium text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {/* 🚀 替换: process.cancel -> common.cancel */}
          {t("common.cancel")}
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-3 rounded-lg font-qs-medium text-sm bg-link text-white hover:bg-link-hover shadow-lg shadow-link/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {type === "register"
            ? t("transaction.title.register")
            : t("transaction.title.renew")}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => {
    // 🚀 替换: process.status.processing -> transaction.status.processing
    let message = t("transaction.status.processing");
    // 🚀 替换: process.status.confirm_wallet -> transaction.status.confirm_wallet
    let subMessage = t("transaction.status.confirm_wallet");
    let showTimer = false;

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

        <h3 className="text-lg font-qs-medium text-text-main mb-1">
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

  const renderSuccess = () => (
    <div className="text-center py-6 animate-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-3xl mx-auto mb-4 border border-green-100">
        <FontAwesomeIcon icon={faCheckCircle} />
      </div>
      <h3 className="text-xl font-qs-medium text-text-main mb-2">
        {type === "register"
          ? t("transaction.result.success_register")
          : t("transaction.result.success_renew")}
      </h3>
      <p className="text-sm text-gray-500 mb-6 px-4">
        {t("transaction.result.success_desc")}
      </p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-lg font-qs-medium text-sm bg-link text-white hover:bg-link-hover transition-all active:scale-95 shadow-lg shadow-link/20"
      >
        {/* 🚀 替换: process.btn.finish -> common.finish */}
        {t("common.finish")}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleSafeClose}
      maxWidth="max-w-sm"
      title={
        <div className="flex items-center gap-2">
          {!isProcessing && !isSuccess && (
            <FontAwesomeIcon icon={faCalendarAlt} className="text-link" />
          )}
          <span>
            {isProcessing
              ? t("transaction.title.processing")
              : isSuccess
                ? t("transaction.title.done")
                : title}
          </span>
        </div>
      }
      showCloseButton={isIdle}
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
            <p className="text-text-main font-bold mb-1">
              {t("transaction.result.error_title")}
            </p>
            <p className="text-xs text-gray-500 mb-6">
              {t("transaction.result.error_desc")}
            </p>
            <button
              onClick={onClose}
              className="text-link text-sm font-qs-medium hover:underline"
            >
              {/* 🚀 替换: process.btn.retry -> common.retry */}
              {t("common.retry")}
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  );
};
