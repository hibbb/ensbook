// src/pages/Home/HomeFloatingBar.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

interface HomeFloatingBarProps {
  selectedCount: number;
  isBusy: boolean;
  isConnected: boolean;
  onBatchRenew: () => void;
  onClearSelection: () => void;
}

export const HomeFloatingBar = ({
  selectedCount,
  isBusy,
  isConnected,
  onBatchRenew,
  onClearSelection,
}: HomeFloatingBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4">
        <span className="text-sm font-qs-medium text-text-main">
          已选择 <span className="text-link font-bold">{selectedCount}</span>{" "}
          个域名
        </span>
        <div className="h-4 w-px bg-gray-300 mx-1" />

        <button
          onClick={onBatchRenew}
          disabled={!isConnected || isBusy}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm ${
            !isConnected || isBusy
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-link text-white hover:bg-link-hover hover:shadow-md active:scale-95"
          }`}
        >
          <FontAwesomeIcon icon={faRotate} spin={isBusy} />
          批量续费
        </button>

        <button
          onClick={onClearSelection}
          className="ml-2 text-xs text-gray-400 hover:text-text-main underline decoration-gray-300 underline-offset-2"
        >
          取消
        </button>
      </div>
    </div>
  );
};
