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
  faFeatherPointed, // 🚀 新增图标
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { BaseModal } from "../ui/BaseModal";
import { DataBackupView } from "./DataBackupView";
import { AboutView } from "./AboutView";
// 🚀 引入新组件
import { MyCollectionSettings } from "./MyCollectionSettings";
import pkg from "../../../package.json";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 🚀 扩展 Tab 类型
type SettingsTab =
  | "general"
  | "registration"
  | "data"
  | "about"
  | "my-collection";

interface SidebarItemProps {
  icon: IconDefinition;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

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
        ? "bg-gray-100 text-black font-qs-bold" // 激活态样式微调为黑色，更显沉稳
        : disabled
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-500 hover:bg-gray-50 hover:text-text-main"
    }`}
  >
    <div
      className={`w-5 flex justify-center ${active ? "text-black" : "text-gray-400"}`}
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
  // 🚀 默认 Tab 建议先保持 data 或 about，或者也可以改成 my-collection 方便调试
  const [activeTab, setActiveTab] = useState<SettingsTab>("data");

  const getTitle = () => {
    switch (activeTab) {
      case "data":
        return "备份与恢复";
      case "my-collection":
        return "我的集合 (Mine)"; // 🚀 对应标题
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
      title={null}
      showCloseButton={false}
    >
      <div className="flex h-[600px] max-h-[80vh] w-full">
        {/* 左侧侧边栏 */}
        <div className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-6">
            <h3 className="text-xl font-qs-bold text-text-main tracking-tight">
              Settings
            </h3>
          </div>
          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar flex flex-col">
            {/* 🚀 新增入口：我的集合 */}
            <div className="mb-2">
              <div className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">
                Features
              </div>
              <SidebarItem
                icon={faFeatherPointed}
                label="我的集合"
                active={activeTab === "my-collection"}
                onClick={() => setActiveTab("my-collection")}
              />
            </div>

            <div className="mb-2">
              <div className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">
                System
              </div>
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
            </div>

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
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 shrink-0">
            <h4 className="text-lg font-qs-bold text-gray-800">{getTitle()}</h4>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors outline-none focus:ring-2 focus:ring-gray-200"
            >
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
          </div>

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {activeTab === "data" && <DataBackupView onClose={onClose} />}
            {activeTab === "about" && <AboutView />}
            {/* 🚀 渲染新组件 */}
            {activeTab === "my-collection" && <MyCollectionSettings />}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
