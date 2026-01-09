// src/pages/Home/HomeSearchSection.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next"; // 🚀
import { Tooltip } from "../../components/ui/Tooltip";

interface HomeSearchSectionProps {
  hasContent: boolean;
  inputValue: string;
  isResolving: boolean;
  onInputChange: (val: string) => void;
  onSubmit: () => void;
  onOpenHelp: () => void;
}

export const HomeSearchSection = ({
  hasContent,
  inputValue,
  isResolving,
  onInputChange,
  onSubmit,
  onOpenHelp,
}: HomeSearchSectionProps) => {
  const { t } = useTranslation(); // 🚀

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div
      className={`flex flex-col items-center transition-all duration-700 ease-in-out z-40 ${
        hasContent
          ? "sticky top-0 py-4 mb-6 bg-background/80 backdrop-blur-md"
          : "flex-1 justify-center -mt-60"
      }`}
    >
      {!hasContent && (
        <h1 className="text-4xl font-qs-regular text-text-main mb-8 tracking-tight animate-in fade-in zoom-in duration-500">
          <span className="text-link">{t("home.search.title")}</span> ENS
        </h1>
      )}

      <div
        className={`relative w-full transition-all duration-500 ${
          hasContent ? "max-w-3xl" : "max-w-2xl"
        }`}
      >
        <div className="relative group">
          <Tooltip content={t("home.search.help_tooltip")}>
            <button
              onClick={onOpenHelp}
              className="absolute left-2 top-2 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-400 transition-all active:scale-95 z-10"
            >
              <FontAwesomeIcon icon={faLightbulb} size="sm" />
            </button>
          </Tooltip>
          <input
            type="text"
            className="w-full h-14 pl-14 pr-14 rounded-full border border-gray-200 bg-white shadow-sm text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-link/20 focus:border-link transition-all"
            placeholder={
              hasContent
                ? t("home.search.placeholder_content")
                : t("home.search.placeholder_empty")
            }
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={onSubmit}
            disabled={!inputValue.trim() || isResolving}
            className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-full bg-link text-white hover:bg-link-hover disabled:bg-gray-200 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isResolving ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faArrowRight} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
