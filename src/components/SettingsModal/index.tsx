// src/components/SettingsModal/index.tsx

import { useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faDatabase,
  faGlobe,
  faClock,
  faPalette,
  faCircleInfo,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { DataBackupView } from "./DataBackupView";
import { AboutView } from "./AboutView"; // 🚀 引入拆分后的组件
import pkg from "../../../package.json";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "general" | "registration" | "data" | "about";

// SidebarItem 接口
interface SidebarItemProps {
  icon: IconDefinition;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// 辅助组件：侧边栏按钮
const SidebarItem = ({
  icon,
  label,
  active,
  onClick,
  disabled,
}: SidebarItemProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-qs-medium rounded-xl transition-all duration-200 ${
      active
        ? "bg-white text-link shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] ring-1 ring-black/5"
        : disabled
          ? "text-gray-300 cursor-not-allowed opacity-60"
          : "text-gray-500 hover:bg-gray-200/50 hover:text-text-main"
    }`}
  >
    <div
      className={`w-5 flex justify-center ${active ? "text-link" : "text-gray-400"}`}
    >
      <FontAwesomeIcon icon={icon} />
    </div>
    <span>{label}</span>
    {disabled && (
      <span className="ml-auto text-[10px] bg-gray-200/50 text-gray-400 px-1.5 py-0.5 rounded font-qs-bold">
        Soon
      </span>
    )}
  </button>
);

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("data");

  if (!isOpen) return null;

  // 根据 Tab 计算标题
  const getTitle = () => {
    switch (activeTab) {
      case "data":
        return "备份与恢复";
      case "about":
        return "关于 ENSBook";
      default:
        return "设置";
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 模态框主体 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[600px] flex overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 左侧侧边栏 */}
        <div className="w-56 bg-gray-50 border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-6 border-b border-gray-100/50">
            <h3 className="text-xl font-qs-bold text-text-main tracking-tight">
              Settings
            </h3>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto flex flex-col">
            <SidebarItem
              icon={faDatabase}
              label="数据管理"
              active={activeTab === "data"}
              onClick={() => setActiveTab("data")}
            />
            <SidebarItem
              icon={faGlobe}
              label="语言 / Language"
              active={activeTab === "general"}
              disabled
            />
            <SidebarItem
              icon={faClock}
              label="注册偏好"
              active={activeTab === "registration"}
              disabled
            />
            <SidebarItem icon={faPalette} label="外观" disabled />

            <div className="flex-1"></div>
            {/* 关于按钮 */}
            <SidebarItem
              icon={faCircleInfo}
              label="关于"
              active={activeTab === "about"}
              onClick={() => setActiveTab("about")}
            />
          </nav>

          {/* 版本号 */}
          <div className="p-4 text-xs text-gray-300 text-center border-t border-gray-100/50 font-qs-medium">
            ENSBook v{pkg.version}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-50">
            <h4 className="text-lg font-qs-bold text-gray-800">{getTitle()}</h4>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === "data" && <DataBackupView onClose={onClose} />}
            {activeTab === "about" && <AboutView />}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
