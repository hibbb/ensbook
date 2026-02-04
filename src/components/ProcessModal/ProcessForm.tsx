// src/components/ProcessModal/ProcessForm.tsx

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCalendarDay,
  faMinus,
  faPlus,
  faTriangleExclamation,
  faChevronDown,
  faChevronUp,
  faSpinner, // 🚀
  faCheck, // 🚀
  faXmark, // 🚀
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { truncateAddress } from "../../utils/format"; // 🚀

interface ProcessFormProps {
  mode: "duration" | "until";
  setMode: (m: "duration" | "until") => void;
  years: number;
  setYears: (y: number) => void;
  days: number;
  setDays: (d: number) => void;
  targetDate: string;
  setTargetDate: (d: string) => void;
  minDateValue: string;
  skippedCount: number;
  type: "register" | "renew" | "batch";
  // 🚀 更新 Props 定义
  recipientInput: string;
  setRecipientInput: (val: string) => void;
  resolvedAddress: string | null;
  isResolving: boolean;
  resolveError: string | null;
}

export const ProcessForm = ({
  mode,
  setMode,
  years,
  setYears,
  days,
  setDays,
  targetDate,
  setTargetDate,
  minDateValue,
  skippedCount,
  type,
  // 🚀 解构新 Props
  recipientInput,
  setRecipientInput,
  resolvedAddress,
  isResolving,
  resolveError,
}: ProcessFormProps) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      {/* ... (Mode Switcher 和 时长选择器 保持不变，省略以节省篇幅) ... */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setMode("duration")}
          className={`flex-1 py-2 text-sm font-sans font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${mode === "duration" ? "bg-white text-link shadow-sm" : "text-gray-500 hover:text-text-main"}`}
        >
          <FontAwesomeIcon icon={faClock} />
          {t("transaction.mode.duration")}
        </button>
        <button
          onClick={() => setMode("until")}
          className={`flex-1 py-2 text-sm font-sans font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${mode === "until" ? "bg-white text-link shadow-sm" : "text-gray-500 hover:text-text-main"}`}
        >
          <FontAwesomeIcon icon={faCalendarDay} />
          {t("transaction.mode.until")}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        {mode === "duration" ? (
          <div className="flex items-center gap-4">
            {/* ... (Years/Days Inputs 保持不变) ... */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 w-full justify-center">
                <button
                  onClick={() => setYears(Math.max(0, years - 1))}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faMinus} size="xs" />
                </button>
                <div className="flex-1 relative min-w-[60px]">
                  <input
                    type="number"
                    min="0"
                    value={years}
                    onChange={(e) =>
                      setYears(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full text-center text-2xl font-mono text-text-main bg-transparent outline-none border-b border-transparent focus:border-link transition-colors appearance-none m-0 p-0"
                  />
                  <span className="block text-center text-xs text-gray-400 font-sans font-medium mt-1">
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
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 w-full justify-center">
                <button
                  onClick={() => setDays(Math.max(0, days - 1))}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faMinus} size="xs" />
                </button>
                <div className="flex-1 relative min-w-[60px]">
                  <input
                    type="number"
                    min="0"
                    value={days}
                    onChange={(e) =>
                      setDays(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full text-center text-2xl font-mono text-text-main bg-transparent outline-none border-b border-transparent focus:border-link transition-colors appearance-none m-0 p-0"
                  />
                  <span className="block text-center text-xs text-gray-400 font-sans font-medium mt-1">
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
            <label className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider">
              {t("transaction.mode.until")}
            </label>
            <input
              type="date"
              value={targetDate}
              min={minDateValue}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-lg font-sans font-medium text-text-main outline-none focus:ring-2 focus:ring-link/20 focus:border-link transition-all"
            />
            {type === "batch" && (
              <p className="text-xs text-gray-400 mt-1">
                {t("transaction.mode.until_desc_batch")}
              </p>
            )}
            {skippedCount > 0 && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-orange-50 border border-orange-100 rounded-md text-orange-600 text-xs font-sans font-medium animate-in fade-in slide-in-from-top-1">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mt-0.5"
                />
                <span>
                  {t("transaction.mode.partial_skip", { count: skippedCount })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 高级设置 */}
        {type === "register" && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600 font-sans font-medium transition-colors"
            >
              <FontAwesomeIcon
                icon={showAdvanced ? faChevronUp : faChevronDown}
              />
              {t("transaction.settings.advanced")}
            </button>

            {showAdvanced && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                  {t("transaction.settings.recipient")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder={t(
                      "transaction.settings.recipient_placeholder",
                    )}
                    className={`w-full p-2 bg-gray-50 border rounded-lg text-sm font-mono text-text-main outline-none focus:ring-2 transition-all pr-8
                      ${resolveError ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-link/20 focus:border-link"}
                    `}
                  />

                  {/* 🚀 状态图标 */}
                  <div className="absolute right-3 top-2.5 text-xs">
                    {isResolving && (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        className="text-link"
                      />
                    )}
                    {!isResolving && resolvedAddress && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-green-500"
                      />
                    )}
                    {!isResolving && resolveError && (
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="text-red-400"
                      />
                    )}
                  </div>
                </div>

                {/* 🚀 解析结果反馈 */}
                <div className="mt-1.5 min-h-[1.25rem]">
                  {isResolving ? (
                    <span className="text-xs text-gray-400">
                      {t("account.resolving")}
                    </span>
                  ) : resolveError ? (
                    <span className="text-xs text-red-400">{resolveError}</span>
                  ) : resolvedAddress ? (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded-lg w-fit">
                      <FontAwesomeIcon icon={faCheck} size="xs" />
                      {truncateAddress(resolvedAddress)}
                    </div>
                  ) : recipientInput ? null : ( // 有输入但还没解析完或还没触发
                    // 空输入，显示默认提示
                    <p className="text-[10px] text-orange-500 flex items-center gap-1">
                      <FontAwesomeIcon icon={faTriangleExclamation} />
                      {t("transaction.settings.recipient_warning")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
