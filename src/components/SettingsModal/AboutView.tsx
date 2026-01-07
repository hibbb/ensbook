// src/components/SettingsModal/AboutView.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export const AboutView = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. 头部信息 */}
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

      {/* 2. 简介：扁平化文本 */}
      <p className="text-sm text-gray-600 leading-relaxed font-qs-regular text-center px-8">
        ENSBook 是一个高效的 ENS
        域名管理工具，旨在帮助用户更便捷地管理、监控和记录其持有的以太坊域名资产。
      </p>

      {/* 链接列表模块 */}
      <div>
        <h5 className="text-xs font-qs-semibold text-gray-400 uppercase tracking-wider px-1 mb-2 border-b border-gray-100 pb-2">
          Connect
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* 作者 X 账号 - 扁平列表项风格 */}
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
              <div className="text-sm font-qs-semibold text-text-main group-hover:text-link transition-colors">
                Author
              </div>
              <div className="text-xs text-gray-500">@forlbb</div>
            </div>
          </a>

          {/* GitHub 仓库 - 扁平列表项风格 */}
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
              <div className="text-sm font-qs-semibold text-text-main group-hover:text-link transition-colors">
                GitHub
              </div>
              <div className="text-xs text-gray-500">Open Source Project</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
