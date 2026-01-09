// src/components/SettingsModal/LanguageView.tsx

import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { updateSettings } from "../../services/storage/userStore";

export const LanguageView = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: "en" | "zh") => {
    // 1. 切换语言
    i18n.changeLanguage(lang);

    // 2. 持久化
    updateSettings({ locale: lang });

    // 🚀 3. 修复：使用静态映射，确保提示语与目标语言绝对一致
    const messages = {
      en: "Language switched to English",
      zh: "已切换为简体中文",
    };

    // 立即显示，无需 setTimeout
    toast.success(messages[lang], { id: "lang-switch" });
  };

  const currentLang = i18n.language;

  const languages = [
    { code: "en", label: t("language_view.options.en"), flag: "🇺🇸" },
    { code: "zh", label: t("language_view.options.zh"), flag: "🇨🇳" },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed font-qs-medium">
          {t("language_view.desc")}
        </p>

        <div className="grid grid-cols-1 gap-3">
          {languages.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left group
                  ${
                    isActive
                      ? "bg-link/5 border-link shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                <div className="text-2xl">{lang.flag}</div>
                <div className="flex-1">
                  <div
                    className={`text-sm font-qs-semibold ${
                      isActive ? "text-link" : "text-text-main"
                    }`}
                  >
                    {lang.label}
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">
                    {lang.code.toUpperCase()}
                  </div>
                </div>
                {isActive && (
                  <div className="text-link animate-in zoom-in duration-300">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
