// src/components/SettingsModal/AboutView.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";

export const AboutView = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col items-center justify-center py-2 text-center gap-2">
        <img
          src="/logo-glasses-with-title-870-500.png"
          alt="ENSBook Logo"
          className="w-auto h-16 md:h-28 mx-auto object-contain pointer-events-none"
        />
        <p className="text-sm text-gray-400 tracking-tight">
          v{__APP_VERSION__}
        </p>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed font-sans font-regular text-center px-8">
        {t("settings.about.description")}
      </p>

      <div>
        <h5 className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2 border-b border-gray-100 pb-2">
          {t("settings.about.connect")}
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <a
            href={__APP_AUTHOR_URL__}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <img
              src="/logo_benben_320.png"
              alt="Author Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-sans font-semibold text-text-main group-hover:text-link transition-colors">
                {t("settings.about.author")}
              </div>
              <div className="text-xs text-gray-500">@forlbb</div>
            </div>
          </a>

          <a
            href={__APP_REPO_URL__}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 flex items-center justify-center text-gray-600 group-hover:text-black transition-colors">
              <FontAwesomeIcon icon={faGithub} className="text-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-sans font-semibold text-text-main group-hover:text-link transition-colors">
                {t("settings.about.github")}
              </div>
              <div className="text-xs text-gray-500">
                {t("settings.about.open_source")}
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
