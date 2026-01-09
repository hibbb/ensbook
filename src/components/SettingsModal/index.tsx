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
  faFeatherPointed,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { BaseModal } from "../ui/BaseModal";
import { DataBackupView } from "./DataBackupView";
import { AboutView } from "./AboutView";
import { MyCollectionSettings } from "./MyCollectionSettings";
// 🚀 引入新组件
import { LanguageView } from "./LanguageView";
import pkg from "../../../package.json";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 🚀 1. 增加 language 类型
type SettingsTab =
  | "general" // 这里的 general 实际上对应的是 Language 按钮，建议改名或映射
  | "language" // 我们显式增加一个 language 类型
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
  badge?: string;
}

const SidebarItem = ({
  icon,
  label,
  active,
  onClick,
  disabled,
  badge,
}: SidebarItemProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-qs-medium transition-colors duration-150 rounded-md ${
      active
        ? "bg-gray-100 text-black font-qs-semibold"
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
    {disabled && badge && (
      <span className="ml-auto text-[10px] bg-gray-50 text-gray-300 px-1.5 py-0.5 rounded-sm font-qs-semibold">
        {badge}
      </span>
    )}
  </button>
);

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("my-collection");
  const { t } = useTranslation();

  const getTitle = () => {
    switch (activeTab) {
      case "data":
        return t("settings.title.backup");
      case "my-collection":
        return t("settings.title.my_collection");
      case "about":
        return t("settings.title.about");
      // 🚀 2. 增加标题映射
      case "language":
        return t("settings.title.language");
      default:
        return t("settings.title.default");
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
        <div className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-6">
            <h3 className="text-xl font-qs-semibold text-text-main tracking-tight">
              Settings
            </h3>
          </div>
          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="mb-2">
              <div className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">
                {t("settings.section.features")}
              </div>
              <SidebarItem
                icon={faFeatherPointed}
                label={t("settings.sidebar.my_collection")}
                active={activeTab === "my-collection"}
                onClick={() => setActiveTab("my-collection")}
              />
            </div>

            <div className="mb-2">
              <div className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">
                {t("settings.section.system")}
              </div>
              <SidebarItem
                icon={faDatabase}
                label={t("settings.sidebar.data")}
                active={activeTab === "data"}
                onClick={() => setActiveTab("data")}
              />

              {/* 🚀 3. 启用语言按钮 */}
              <SidebarItem
                icon={faGlobe}
                label={t("settings.sidebar.language")}
                active={activeTab === "language"}
                onClick={() => setActiveTab("language")}
                // 移除 disabled 和 badge
              />

              <SidebarItem
                icon={faClock}
                label={t("settings.sidebar.registration")}
                active={activeTab === "registration"}
                disabled
                badge={t("settings.badge.soon")}
              />
              <SidebarItem
                icon={faPalette}
                label={t("settings.sidebar.appearance")}
                disabled
                badge={t("settings.badge.soon")}
              />
            </div>

            <div className="flex-1"></div>
            <SidebarItem
              icon={faCircleInfo}
              label={t("settings.sidebar.about")}
              active={activeTab === "about"}
              onClick={() => setActiveTab("about")}
            />
          </nav>

          <div className="p-4 text-xs text-gray-300 text-center font-qs-medium">
            ENSBook v{pkg.version}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 shrink-0">
            <h4 className="text-lg font-qs-semibold text-gray-800">
              {getTitle()}
            </h4>
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
            {activeTab === "my-collection" && <MyCollectionSettings />}
            {/* 🚀 4. 渲染语言视图 */}
            {activeTab === "language" && <LanguageView />}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
