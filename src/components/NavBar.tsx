// src/components/NavBar.tsx

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMagnifyingGlass,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { SettingsModal } from "./SettingsModal"; // 🚀 引入新的设置模态框

export const NavBar = () => {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `text-sm font-qs-semibold transition-all py-1 border-b-2 ${
      isActive
        ? "text-link border-link"
        : "text-text-main border-transparent hover:text-link hover:border-link/30"
    }`;
  };

  return (
    <>
      <nav className="relative z-50 flex justify-between items-center mb-5 pb-6 border-b border-table-border">
        {/* 左侧：Logo 与 页面链接 */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-3xl font-qs-regular transition-colors text-link hover:text-link-hover"
          >
            <span className="text-text-main">ENS</span>Book
          </Link>

          <div className="hidden md:flex gap-6">
            <Link to="/" className={getLinkClass("/")}>
              <FontAwesomeIcon icon={faMagnifyingGlass} /> Home
            </Link>
            <Link
              to="/collection/999"
              className={getLinkClass("/collection/999")}
            >
              <FontAwesomeIcon icon={faBars} /> 999
            </Link>
            <Link
              to="/collection/bip39"
              className={getLinkClass("/collection/bip38")}
            >
              <FontAwesomeIcon icon={faBars} /> BIP39
            </Link>
          </div>
        </div>

        {/* 右侧：功能区 */}
        <div className="flex items-center gap-3">
          {/* 🚀 设置入口 - 紧邻 ConnectKitButton 左侧 */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm text-gray-400 hover:text-text-main hover:bg-gray-100 transition-all active:scale-95 group"
            title="设置 / Settings"
          >
            <FontAwesomeIcon
              icon={faGear}
              size="lg"
              className="group-hover:rotate-90 transition-transform duration-500"
            />
          </button>

          {/* 钱包连接 */}
          <ConnectKitButton />
        </div>
      </nav>

      {/* 🚀 挂载设置 Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
