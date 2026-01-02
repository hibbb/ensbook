// src/components/SettingsModal/index.tsx

import { useState } from "react";
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
import { BaseModal } from "../ui/BaseModal"; // 🚀 引入 BaseModal
import { DataBackupView } from "./DataBackupView";
import { AboutView } from "./AboutView";
import pkg from "../../../package.json";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "general" | "registration" | "data" | "about";

interface SidebarItemProps {
  icon: IconDefinition;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// 辅助组件：侧边栏按钮 (保持不变)
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
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-qs-medium transition-colors duration-150 rounded-md ${
      active
        ? "bg-gray-100 text-link font-qs-bold"
        : disabled
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-500 hover:bg-gray-50 hover:text-text-main"
    }`}
  >
    <div
      className={`w-5 flex justify-center ${active ? "text-link" : "text-gray-400"}`}
    >
      <FontAwesomeIcon icon={icon} />
    </div>
    <span>{label}</span>
    {disabled && (
      <span className="ml-auto text-[10px] bg-gray-50 text-gray-300 px-1.5 py-0.5 rounded-sm font-qs-bold">
        Soon
      </span>
    )}
  </button>
);

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("data");

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      // 🚀 隐藏 BaseModal 默认的标题栏，以便保留侧边栏布局的完整性
      title={null}
      showCloseButton={false}
    >
      {/* 内部布局容器：固定高度以维持侧边栏设计 */}
      <div className="flex h-[600px] max-h-[80vh] w-full">
        {/* 左侧侧边栏 */}
        <div className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-6">
            <h3 className="text-xl font-qs-bold text-text-main tracking-tight">
              Settings
            </h3>
          </div>
          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar flex flex-col">
            <SidebarItem
              icon={faDatabase}
              label="数据管理"
              active={activeTab === "data"}
              onClick={() => setActiveTab("data")}
            />
            <SidebarItem
              icon={faGlobe}
              label="语言"
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
            <SidebarItem
              icon={faCircleInfo}
              label="关于"
              active={activeTab === "about"}
              onClick={() => setActiveTab("about")}
            />
          </nav>

          <div className="p-4 text-xs text-gray-300 text-center font-qs-medium">
            ENSBook v{pkg.version}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* 右侧顶部标题栏 (包含关闭按钮) */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 shrink-0">
            <h4 className="text-lg font-qs-bold text-gray-800">{getTitle()}</h4>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors outline-none focus:ring-2 focus:ring-gray-200"
            >
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
          </div>

          {/* 可滚动的内容区域 */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {activeTab === "data" && <DataBackupView onClose={onClose} />}
            {activeTab === "about" && <AboutView />}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
