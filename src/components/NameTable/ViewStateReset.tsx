// src/components/NameTable/ViewStateReset.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilterCircleXmark } from "@fortawesome/free-solid-svg-icons";

interface ViewStateResetProps {
  isVisible: boolean;
  onReset: () => void;
  hasSelection: boolean; // 用于判断是否需要避让批量操作栏
}

export const ViewStateReset = ({
  isVisible,
  onReset,
  hasSelection,
}: ViewStateResetProps) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ease-in-out ${
        hasSelection ? "bottom-24" : "bottom-8"
      }`}
    >
      <button
        onClick={onReset}
        className="
          flex items-center gap-2 px-4 py-2
          bg-link backdrop-blur-md text-white
          rounded-full shadow-lg
          hover:bg-link-hover hover:scale-105 active:scale-95
          transition-all duration-200 group
        "
      >
        <FontAwesomeIcon
          icon={faFilterCircleXmark}
          className="text-white transition-colors"
        />
        <span className="text-sm font-qs-bold pr-1">重置视图</span>
      </button>
    </div>
  );
};
