// src/components/FloatingBar.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

interface FloatingBarProps {
  selectedCount: number;
  isBusy: boolean;
  isConnected: boolean;
  onBatchRenew: () => void;
  onClearSelection: () => void;
}

export const FloatingBar = ({
  selectedCount,
  isBusy,
  isConnected,
  onBatchRenew,
  onClearSelection,
}: FloatingBarProps) => {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4">
        <span className="text-sm font-sans font-medium text-text-main">
          {t("home.floating_bar.selected", { count: selectedCount })}
        </span>
        <div className="h-4 w-px bg-gray-300 mx-1" />

        <button
          onClick={onBatchRenew}
          disabled={!isConnected || isBusy}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-sans font-semibold transition-all shadow-sm ${
            !isConnected || isBusy
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-link text-white hover:bg-link-hover hover:shadow-md active:scale-95"
          }`}
        >
          <FontAwesomeIcon icon={faRotate} spin={isBusy} />
          {t("home.floating_bar.renew_batch")}
        </button>

        <button
          onClick={onClearSelection}
          className="ml-2 text-xs text-gray-400 hover:text-text-main underline decoration-gray-300 underline-offset-2"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
};
