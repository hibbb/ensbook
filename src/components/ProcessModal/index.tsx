// src/components/ProcessModal/index.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { type Address } from "viem"; // 🚀
import { BaseModal } from "../ui/BaseModal";
import { useProcessForm } from "./useProcessForm";
import { ProcessForm } from "./ProcessForm";
import { ProcessingView, SuccessView, ErrorView } from "./StatusViews";

export type ProcessType = "register" | "renew" | "batch";

interface ProcessModalProps {
  isOpen: boolean;
  type: ProcessType;
  status: string;
  txHash?: string | null;
  secondsLeft?: number;
  onClose: () => void;
  // 🚀 修改：onConfirm 接收可选的 owner
  onConfirm: (durations: bigint[], owner?: Address) => void;
  title: string;
  currentExpiry?: number;
  itemCount?: number;
  expiryTimes?: number[];
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
  itemCount = 1,
  expiryTimes = [],
}: ProcessModalProps) => {
  const { t } = useTranslation();

  const {
    mode,
    setMode,
    years,
    setYears,
    days,
    setDays,
    targetDate,
    setTargetDate,
    minDateValue,
    calculatedDurations,
    skippedCount,
    validationError,
    // 🚀 解构
    recipient,
    setRecipient,
  } = useProcessForm({
    isOpen,
    type,
    currentExpiry,
    expiryTimes,
    itemCount,
  });

  const isIdle = status === "idle";
  const isSuccess = status === "success";
  const isError = status === "error";
  const isProcessing = !isIdle && !isSuccess && !isError;

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (!validationError) {
      // 🚀 传递 recipient (如果是空字符串，传 undefined)
      const ownerAddress = recipient ? (recipient as Address) : undefined;
      onConfirm(calculatedDurations, ownerAddress);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
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
      showCloseButton={true}
    >
      <div className="p-4">
        {isIdle && (
          <>
            <ProcessForm
              mode={mode}
              setMode={setMode}
              years={years}
              setYears={setYears}
              days={days}
              setDays={setDays}
              targetDate={targetDate}
              setTargetDate={setTargetDate}
              minDateValue={minDateValue}
              skippedCount={skippedCount}
              type={type}
              // 🚀 传递
              recipient={recipient}
              setRecipient={setRecipient}
            />

            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-500 text-sm font-qs-medium animate-in fade-in slide-in-from-top-1">
                <FontAwesomeIcon icon={faExclamationCircle} />
                {validationError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-lg font-qs-semibold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
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
                {type === "register"
                  ? t("transaction.btn.start_register")
                  : t("transaction.btn.confirm_renew")}
              </button>
            </div>
          </>
        )}

        {isProcessing && (
          <ProcessingView
            status={status}
            secondsLeft={secondsLeft}
            txHash={txHash}
            onClose={handleClose}
          />
        )}

        {isSuccess && <SuccessView type={type} onClose={handleClose} />}

        {isError && <ErrorView onClose={handleClose} />}
      </div>
    </BaseModal>
  );
};
