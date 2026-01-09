// src/components/NameTable/ViewStateReset.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilterCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next"; // 🚀

interface ViewStateResetProps {
  isVisible: boolean;
  onReset: () => void;
  hasSelection: boolean;
  totalCount: number;
  filteredCount: number;
}

export const ViewStateReset = ({
  isVisible,
  onReset,
  hasSelection,
  totalCount,
  filteredCount,
}: ViewStateResetProps) => {
  const { t } = useTranslation(); // 🚀

  if (!isVisible) return null;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ease-in-out ${
        hasSelection ? "bottom-24" : "bottom-8"
      }`}
    >
      <div
        className="
          flex items-center p-1 pl-4
          bg-link/90 backdrop-blur-md text-white
          rounded-full shadow-lg shadow-link/20
          animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200
        "
      >
        <div className="flex items-center gap-1 text-xs font-qs-medium mr-3 select-none">
          <span className="font-bold text-white">{filteredCount}</span>
          <span className="text-white/60">/</span>
          <span className="text-white/80">{totalCount}</span>
        </div>

        <div className="w-px h-4 bg-white/20"></div>

        <button
          onClick={onReset}
          className="
            flex items-center gap-2 px-3 py-1.5
            rounded-full
            hover:bg-white/10 active:bg-white/20 active:scale-95
            transition-all duration-200 group
          "
        >
          <span className="text-sm font-qs-semibold">{t("table.reset")}</span>
          <FontAwesomeIcon
            icon={faFilterCircleXmark}
            className="text-white/90 group-hover:rotate-90 transition-transform duration-300"
          />
        </button>
      </div>
    </div>
  );
};
