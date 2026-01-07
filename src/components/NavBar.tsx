// src/components/NavBar.tsx

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faGear,
  faLayerGroup,
  faFeatherPointed,
} from "@fortawesome/free-solid-svg-icons";
import { SettingsModal } from "./SettingsModal";
// 🗑️ 移除不再需要的 Hook 引用
// import { useMyCollectionSource } from "../hooks/useMyCollectionSource";
import { Tooltip } from "./ui/Tooltip";

export const NavBar = () => {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 🗑️ 移除数据源检查逻辑
  // const source = useMyCollectionSource();
  // const hasMine = !!source;

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-2 text-sm font-qs-semibold transition-all py-1 border-b-2 ${
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
            {/* 🚀 注意：在第二步中，我们将把这里的 "/" 改为 "/home" */}
            {/* 🚀 关键变更：Home 菜单项必须显式指向 /home */}
            <Link to="/home" className={getLinkClass("/home")}>
              <FontAwesomeIcon icon={faMagnifyingGlass} /> Home
            </Link>

            {/* 🚀 变更：移除条件渲染，默认显示 Mine */}
            <Link to="/mine" className={getLinkClass("/mine")}>
              <FontAwesomeIcon icon={faFeatherPointed} /> Mine
            </Link>

            <Link
              to="/collection/999"
              className={getLinkClass("/collection/999")}
            >
              <FontAwesomeIcon icon={faLayerGroup} /> 999
            </Link>

            <Link
              to="/collection/bip39"
              className={getLinkClass("/collection/bip39")}
            >
              <FontAwesomeIcon icon={faLayerGroup} /> BIP39
            </Link>
          </div>
        </div>

        {/* 右侧：功能区 */}
        <div className="flex items-center gap-3">
          <Tooltip content="设置">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm text-link hover:text-link-hover hover:bg-gray-100 transition-all active:scale-95 group"
            >
              <FontAwesomeIcon
                icon={faGear}
                size="lg"
                className="group-hover:rotate-90 transition-transform duration-500"
              />
            </button>
          </Tooltip>
          <ConnectKitButton />
        </div>
      </nav>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
