// src/components/NavBar.tsx
import { Link, useLocation } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export const NavBar = () => {
  const location = useLocation();

  // 辅助函数：根据路径判断是否激活，返回对应的样式类
  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;

    // 基础样式：
    // - border-b-2: 预留2px下边框
    // - border-transparent: 默认透明，防止布局抖动
    return `text-sm font-qs-semibold transition-all py-1 border-b-2 ${
      isActive
        ? "text-link border-link" // 激活状态：高亮颜色 + 实色边框
        : "text-text-main border-transparent hover:text-link hover:border-link/30" // 未激活：灰色 + 透明边框 (hover时浅色边框)
    }`;
  };

  return (
    // 🚀 修复：添加 relative z-50 防止被 Home 页面的负边距容器遮挡
    <nav className="relative z-50 flex justify-between items-center mb-5 pb-6 border-b border-table-border">
      {/* 左侧：Logo 与 页面链接 */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-3xl font-qs-regular transition-colors text-link hover:text-link-hover"
        >
          <span className="text-text-main">ENS</span>Book
        </Link>

        {/* 导航链接区域 */}
        <div className="hidden md:flex gap-6">
          <Link to="/" className={getLinkClass("/")}>
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Search
          </Link>
          <Link
            to="/collection/999-club"
            className={getLinkClass("/collection/999-club")}
          >
            <FontAwesomeIcon icon={faBars} /> 999
          </Link>
          <Link
            to="/collection/mnemonic-club"
            className={getLinkClass("/collection/mnemonic-club")}
          >
            <FontAwesomeIcon icon={faBars} /> Mnemonic
          </Link>
        </div>
      </div>

      {/* 右侧：钱包状态与连接按钮 */}
      <div className="flex items-center gap-4">
        <ConnectKitButton />
      </div>
    </nav>
  );
};
