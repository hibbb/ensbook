// src/components/ProcessModal.tsx

import { useState, useEffect, useMemo, useCallback } from "react";
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
  faClock,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { BaseModal } from "./ui/BaseModal";
import {
  MIN_REGISTRATION_DURATION,
  SECONDS_PER_DAY,
  SECONDS_PER_YEAR,
} from "../config/constants";
import { truncateAddress } from "../utils/format";

const formatDateInput = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export type ProcessType = "register" | "renew" | "batch";

interface ProcessModalProps {
  isOpen: boolean;
  type: ProcessType;
  status: string;
  txHash?: string | null;
  secondsLeft?: number;
  onClose: () => void;
  // 🚀 修改：回调接收数组
  onConfirm: (durations: bigint[]) => void;
  title: string;
  currentExpiry?: number;
  // 🚀 新增：接收数量
  itemCount?: number;
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
  currentExpiry,
  // 🚀 默认为 1
  itemCount = 1,
}: ProcessModalProps) => {
  const { t } = useTranslation();

  const [mode, setMode] = useState<"duration" | "until">("duration");
  const [years, setYears] = useState(1);
  const [days, setDays] = useState(0);
  const [targetDate, setTargetDate] = useState("");

  const getBaseTime = useCallback(() => {
    if (type === "renew" && currentExpiry) {
      return currentExpiry;
    }
    return Math.floor(Date.now() / 1000);
  }, [type, currentExpiry]);

  useEffect(() => {
    if (isOpen) {
      setMode("duration");
      setYears(1);
      setDays(0);

      const baseTime = getBaseTime();
      const defaultTarget = new Date(
        (baseTime + Number(SECONDS_PER_YEAR)) * 1000,
      );
      setTargetDate(formatDateInput(defaultTarget));
    }
  }, [isOpen, getBaseTime]);

  const calculatedDuration = useMemo(() => {
    if (mode === "duration") {
      return (
        BigInt(years) * BigInt(SECONDS_PER_YEAR) +
        BigInt(days) * BigInt(SECONDS_PER_DAY)
      );
    } else {
      if (!targetDate) return 0n;
      const targetTs = Math.floor(new Date(targetDate).getTime() / 1000);
      const baseTs = getBaseTime();
      const diff = targetTs - baseTs;
      return diff > 0 ? BigInt(diff) : 0n;
    }
  }, [mode, years, days, targetDate, getBaseTime]);

  const validationError = useMemo(() => {
    const seconds = Number(calculatedDuration);

    if (seconds <= 0) {
      // 🚀 修复引用: transaction.error.*
      return type === "renew"
        ? t("transaction.error.before_expiry")
        : t("transaction.error.past_date");
    }

    if (type === "register" && seconds < MIN_REGISTRATION_DURATION) {
      // 🚀 修复引用: transaction.error.min_duration
      return t("transaction.error.min_duration");
    }

    return null;
  }, [calculatedDuration, type, t]);

  const isIdle = status === "idle";
  const isSuccess = status === "success";
  const isError = status === "error";
  const isProcessing = !isIdle && !isSuccess && !isError;
  const isWaitingWallet =
    status === "loading" || status === "registering" || status === "committing";

  const showModeSwitch = type !== "batch";

  const handleSafeClose = () => {
    if (isIdle) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!validationError) {
      // 🚀 核心修改：作为适配器，将单一时长转换为数组
      // 目前 UI 只有一个统一时长选择器，所以生成一个填充了相同值的数组
      const durations = new Array(itemCount).fill(calculatedDuration);
      onConfirm(durations);
    }
  };

  const renderSettings = () => (
    <div className="animate-in slide-in-from-right-4 duration-300">
      {showModeSwitch && (
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setMode("duration")}
            className={`flex-1 py-2 text-sm font-qs-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              mode === "duration"
                ? "bg-white text-link shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faClock} />
            {/* 🚀 修复引用: transaction.mode.duration */}
            {t("transaction.mode.duration")}
          </button>
          <button
            onClick={() => setMode("until")}
            className={`flex-1 py-2 text-sm font-qs-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              mode === "until"
                ? "bg-white text-link shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faCalendarDay} />
            {/* 🚀 修复引用: transaction.mode.until */}
            {t("transaction.mode.until")}
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        {mode === "duration" ? (
          <div className="flex items-center gap-4">
            {/* 年份 */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 w-full justify-center">
                <button
                  onClick={() => setYears(Math.max(0, years - 1))}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faMinus} size="xs" />
                </button>

                {/* 🚀 修复样式: 显式颜色，去除背景，居中 */}
                <div className="flex-1 relative min-w-[60px]">
                  <input
                    type="number"
                    min="0"
                    value={years}
                    onChange={(e) =>
                      setYears(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full text-center text-2xl font-qs-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-link transition-colors appearance-none m-0 p-0"
                  />
                  <span className="block text-center text-xs text-gray-400 font-qs-medium mt-1">
                    {/* 🚀 修复引用: common.year */}
                    {t("common.year")}
                  </span>
                </div>

                <button
                  onClick={() => setYears(years + 1)}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" />
                </button>
              </div>
            </div>

            <div className="w-px h-12 bg-gray-100"></div>

            {/* 天数 */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 w-full justify-center">
                <button
                  onClick={() => setDays(Math.max(0, days - 1))}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faMinus} size="xs" />
                </button>

                {/* 🚀 修复样式 */}
                <div className="flex-1 relative min-w-[60px]">
                  <input
                    type="number"
                    min="0"
                    value={days}
                    onChange={(e) =>
                      setDays(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full text-center text-2xl font-qs-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-link transition-colors appearance-none m-0 p-0"
                  />
                  <span className="block text-center text-xs text-gray-400 font-qs-medium mt-1">
                    {/* 🚀 修复引用: common.day */}
                    {t("common.day")}
                  </span>
                </div>

                <button
                  onClick={() => setDays(days + 1)}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-qs-bold text-gray-400 uppercase tracking-wider">
              {/* 🚀 修复引用: transaction.mode.until */}
              {t("transaction.mode.until")}
            </label>
            <input
              type="date"
              value={targetDate}
              min={formatDateInput(new Date())}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-lg font-qs-medium text-text-main outline-none focus:ring-2 focus:ring-link/20 focus:border-link transition-all"
            />
          </div>
        )}
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-500 text-sm font-qs-medium animate-in fade-in slide-in-from-top-1">
          <FontAwesomeIcon icon={faExclamationCircle} />
          {validationError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-lg font-qs-semibold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {/* 🚀 修复引用: common.cancel */}
          {t("common.cancel")}
        </button>
        <button
          onClick={handleConfirm}
          disabled={!!validationError}
          className={`flex-1 py-3 rounded-lg font-qs-semibold text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
            ${
              validationError
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-link hover:bg-link-hover shadow-link/20"
            }`}
        >
          {/* 🚀 修复引用: transaction.btn.* */}
          {type === "register"
            ? t("transaction.btn.start_register")
            : t("transaction.btn.confirm_renew")}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => {
    // 🚀 修复引用: transaction.status.*
    let message = t("transaction.status.processing");
    let subMessage = t("transaction.status.confirm_wallet");
    let showTimer = false;

    // 🚀 修复引用: transaction.step.*
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

        <h3 className="text-lg font-qs-semibold text-text-main mb-1">
          {message}
        </h3>
        <p className="text-xs text-gray-500 mb-6 max-w-[85%] mx-auto">
          {subMessage}
        </p>

        {txHash && (
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md text-xs text-link hover:text-link-hover hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <span>{truncateAddress(txHash, 10, 8)}</span>
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
      <h3 className="text-xl font-qs-semibold text-text-main mb-2">
        {/* 🚀 修复引用: transaction.result.* */}
        {type === "register"
          ? t("transaction.result.success_register")
          : t("transaction.result.success_renew")}
      </h3>
      <p className="text-sm text-gray-500 mb-6 px-4">
        {t("transaction.result.success_desc")}
      </p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-lg font-qs-semibold text-sm bg-link text-white hover:bg-link-hover transition-all active:scale-95 shadow-lg shadow-link/20"
      >
        {/* 🚀 修复引用: common.finish */}
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
            {/* 🚀 修复引用: transaction.title.* */}
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
      <div className="p-4">
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
              className="text-link text-sm font-qs-semibold hover:underline"
            >
              {/* 🚀 修复引用: common.retry */}
              {t("common.retry")}
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  );
};
