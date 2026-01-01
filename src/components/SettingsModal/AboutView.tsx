// src/components/SettingsModal/AboutView.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// 引入 GitHub 品牌图标
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import pkg from "../../../package.json";

export const AboutView = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. 头部信息：使用图片 Logo，紧凑布局 */}
      <div className="flex flex-col items-center justify-center py-2 text-center gap-2">
        <img
          src="/logo-glasses-with-title-870-500.png"
          alt="ENSBook Logo"
          // 限制高度，保持比例，居中显示
          className="w-auto h-16 md:h-28 mx-auto object-contain pointer-events-none"
        />
        <p className="text-sm text-gray-400 tracking-tight">v{pkg.version}</p>
      </div>

      {/* 2. 简介：去除包裹背景，保持轻量，居中对齐 */}
      <p className="text-sm text-gray-600 leading-relaxed font-qs-regular text-center px-4">
        ENSBook 是一个高效的 ENS
        域名管理工具，旨在帮助用户更便捷地管理、监控和记录其持有的以太坊域名资产。
      </p>

      {/* 链接列表模块 */}
      <div>
        <h5 className="text-xs font-qs-bold text-gray-400 uppercase tracking-wider px-1 mb-3">
          Connect
        </h5>

        {/* 3. 链接列表布局：桌面端并排显示 (grid-cols-2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 作者 X 账号 */}
          <a
            href="https://x.com/forlbb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all group"
          >
            {/* 4. Author 图标：使用图片替换 FontAwesome 图标 */}
            <img
              src="/logo_benben_320.png"
              alt="Author Logo"
              className="w-10 h-10 rounded-full object-cover border border-gray-100 group-hover:border-gray-200 transition-colors"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-qs-bold text-text-main truncate">
                Author
              </div>
              <div className="text-xs text-gray-500 truncate">@forlbb</div>
            </div>
          </a>

          {/* GitHub 仓库 */}
          <a
            href="https://github.com/hibbb/eb3"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-gray-700 group-hover:text-black transition-colors">
              {/* 5. GitHub 图标：使用 brands 系列图标 */}
              <FontAwesomeIcon icon={faGithub} className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-qs-bold text-text-main truncate">
                GitHub
              </div>
              <div className="text-xs text-gray-500 truncate">
                Open Source Project
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
