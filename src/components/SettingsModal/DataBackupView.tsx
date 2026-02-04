// src/components/SettingsModal/DataBackupView.tsx

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faUpload,
  faTriangleExclamation,
  faTrashCan, // 🚀 新增图标
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  getFullUserData,
  importUserData,
  resetUserCustomData, // 🚀 引入新函数
} from "../../services/storage/userStore";
import type { EnsBookBackup } from "../../types/backup";

interface DataBackupViewProps {
  onClose: () => void;
}

export const DataBackupView = ({ onClose }: DataBackupViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // 🚀 新增状态：控制重置流程
  const [isResetting, setIsResetting] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const handleExport = () => {
    try {
      const userData = getFullUserData();

      const homeCount = userData.homeList.length;
      const metadataCount = Object.keys(userData.metadata).length;

      if (homeCount === 0 && metadataCount === 0) {
        toast.error(t("settings.backup.toast.empty_export"));
        return;
      }

      const backupData: EnsBookBackup = {
        ...userData,
        source: "ENSBook",
        timestamp: Date.now(),
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ensbook-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        t("settings.backup.toast.export_success", { count: metadataCount }),
      );
    } catch (e) {
      console.error(e);
      toast.error(t("settings.backup.toast.export_fail"));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        if (
          json.source !== "ENSBook" ||
          !json.metadata ||
          !Array.isArray(json.homeList)
        ) {
          toast.error(t("settings.backup.toast.invalid_format"));
          return;
        }

        const backup = json as EnsBookBackup;

        const newHomeCount = backup.homeList.length;
        const newMetadataCount = Object.keys(backup.metadata).length;

        const mode = window.confirm(
          t("settings.backup.confirm.content", {
            homeCount: newHomeCount,
            colCount: newMetadataCount,
          }),
        );

        if (!mode) {
          if (!window.confirm(t("settings.backup.confirm.warning"))) {
            e.target.value = "";
            return;
          }
        }

        importUserData(backup, mode ? "merge" : "overwrite");

        toast.success(t("settings.backup.toast.import_success"));
        setTimeout(() => window.location.reload(), 1000);
        onClose();
      } catch (err) {
        console.error(err);
        toast.error(t("settings.backup.toast.parse_fail"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 🚀 新增：处理重置
  const handleResetConfirm = () => {
    if (confirmInput !== "DELETE") return;

    try {
      resetUserCustomData();
      toast.success(t("settings.backup.toast.reset_success"));
      // 强制刷新以重置所有状态
      setTimeout(() => window.location.reload(), 1000);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Reset failed");
    }
  };

  return (
    <div className="space-y-0 animate-in fade-in slide-in-from-right-4 duration-300">
      <section className="py-4 border-b border-gray-100 first:pt-0">
        <div className="flex items-start gap-5">
          <div className="mt-1 text-link text-xl">
            <FontAwesomeIcon icon={faDownload} />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-sans font-semibold text-text-main mb-1">
              {t("settings.backup.export.title")}
            </h5>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed font-sans font-medium">
              {t("settings.backup.export.desc")}
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-cyan-50 text-cyan-700 text-sm font-sans font-semibold rounded-xl border border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300 transition-colors active:scale-95"
            >
              {t("settings.backup.export.btn")}
            </button>
          </div>
        </div>
      </section>

      <section className="py-4 border-b border-gray-100 first:pt-0">
        <div className="flex items-start gap-5">
          <div className="mt-1 text-lime-600 text-xl">
            <FontAwesomeIcon icon={faUpload} />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-sans font-semibold text-text-main mb-1">
              {t("settings.backup.import.title")}
            </h5>
            <div className="text-sm text-gray-500 mb-4 leading-relaxed font-sans font-medium">
              {t("settings.backup.import.desc")}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-lime-700 font-sans font-semibold">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                {t("settings.backup.import.warning")}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-lime-50 text-lime-700 text-sm font-sans font-semibold rounded-xl border border-lime-200 hover:bg-lime-100 hover:border-lime-300 transition-all active:scale-95"
            >
              {t("settings.backup.import.btn")}
            </button>
          </div>
        </div>
      </section>

      {/* 🚀 新增：危险区域 (Clear Data) */}
      <section className="py-4">
        <div className="flex items-start gap-5">
          <div className="mt-1 text-red-500 text-xl">
            <FontAwesomeIcon icon={faTrashCan} />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-sans font-semibold text-text-main mb-1">
              {t("settings.backup.reset.title")}
            </h5>

            {!isResetting ? (
              // 初始状态：显示描述和按钮
              <>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed font-sans font-medium">
                  {t("settings.backup.reset.desc")}
                </p>
                <button
                  onClick={() => setIsResetting(true)}
                  className="px-4 py-2 bg-red-50 text-red-600 text-sm font-sans font-semibold rounded-lg border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all active:scale-95"
                >
                  {t("settings.backup.reset.btn")}
                </button>
              </>
            ) : (
              // 确认状态：显示警告、输入框和确认按钮
              <div className="bg-red-50/50 rounded-lg p-4 border border-red-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-2 text-red-600 text-xs font-sans font-semibold mb-3">
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="mt-0.5"
                  />
                  <div className="leading-relaxed">
                    {t("settings.backup.reset.warning") +
                      t("settings.backup.reset.type_delete")}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder={t("settings.backup.reset.type_delete")}
                    className="flex-1 px-3 py-1.5 text-sm border border-red-200 rounded-xl focus:outline-none focus:border-red-400 text-red-600 placeholder:text-red-200 font-sans font-medium"
                    autoFocus
                  />
                  <button
                    onClick={handleResetConfirm}
                    disabled={confirmInput !== "DELETE"}
                    className={`
                            px-4 py-1.5 text-sm font-sans font-semibold rounded-lg border transition-all
                            ${
                              confirmInput === "DELETE"
                                ? "bg-red-500 border-red-600 text-white hover:bg-red-600 shadow-sm active:scale-95"
                                : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            }
                          `}
                  >
                    {t("settings.backup.reset.confirm_btn")}
                  </button>
                  <button
                    onClick={() => {
                      setIsResetting(false);
                      setConfirmInput("");
                    }}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-text-main font-sans font-medium underline decoration-gray-300 underline-offset-2"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
