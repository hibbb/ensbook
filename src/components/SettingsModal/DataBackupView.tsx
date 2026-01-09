// src/components/SettingsModal/DataBackupView.tsx

import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faUpload,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useTranslation, Trans } from "react-i18next";

import {
  getFullUserData,
  importUserData,
} from "../../services/storage/userStore";
import type { EnsBookBackup } from "../../types/backup";

interface DataBackupViewProps {
  onClose: () => void;
}

export const DataBackupView = ({ onClose }: DataBackupViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleExport = () => {
    try {
      const userData = getFullUserData();

      // 🟢 修复：适配 Global Metadata 结构
      // homeList 是数组，metadata 是对象
      const homeCount = userData.homeList.length;
      const metadataCount = Object.keys(userData.metadata).length;

      if (homeCount === 0 && metadataCount === 0) {
        toast.error(t("backup.toast.empty_export"));
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
        // 这里 count 使用 metadataCount，代表总共备份了多少条数据记录
        t("backup.toast.export_success", { count: metadataCount }),
      );
    } catch (e) {
      console.error(e);
      toast.error(t("backup.toast.export_fail"));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        // 🟢 修复：校验逻辑适配新结构
        // 必须包含 metadata 对象和 homeList 数组
        if (
          json.source !== "ENSBook" ||
          !json.metadata ||
          !Array.isArray(json.homeList)
        ) {
          toast.error(t("backup.toast.invalid_format"));
          return;
        }

        const backup = json as EnsBookBackup;

        // 🟢 修复：统计逻辑适配
        const newHomeCount = backup.homeList.length;
        const newMetadataCount = Object.keys(backup.metadata).length;

        const mode = window.confirm(
          t("backup.confirm.content", {
            homeCount: newHomeCount,
            // 为了复用现有的翻译 key (colCount)，这里传入总记录数
            // 语义上：Collection Records -> Total Records
            colCount: newMetadataCount,
          }),
        );

        if (!mode) {
          if (!window.confirm(t("backup.confirm.warning"))) {
            e.target.value = "";
            return;
          }
        }

        importUserData(backup, mode ? "merge" : "overwrite");

        toast.success(t("backup.toast.import_success"));
        setTimeout(() => window.location.reload(), 1000);
        onClose();
      } catch (err) {
        console.error(err);
        toast.error(t("backup.toast.parse_fail"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 🟢 修复：当前数据概览适配
  const currentData = getFullUserData();
  const currentCount = currentData.homeList.length;

  return (
    <div className="space-y-0 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* 导出区块 */}
      <section className="py-4 border-b border-gray-100 first:pt-0">
        <div className="flex items-start gap-5">
          <div className="mt-1 text-link text-xl">
            <FontAwesomeIcon icon={faDownload} />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-qs-semibold text-gray-900 mb-1">
              {t("backup.export.title")}
            </h5>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed font-qs-medium">
              {t("backup.export.desc")}
              <span className="ml-2 text-gray-400 font-qs-regular">
                {t("backup.export.count", { count: currentCount })}
              </span>
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-text-main text-sm font-qs-semibold rounded hover:bg-gray-200 transition-colors active:scale-95"
            >
              {t("backup.export.btn")}
            </button>
          </div>
        </div>
      </section>

      {/* 导入区块 */}
      <section className="py-6">
        <div className="flex items-start gap-5">
          <div className="mt-1 text-lime-600 text-xl">
            <FontAwesomeIcon icon={faUpload} />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-qs-semibold text-gray-900 mb-1">
              {t("backup.import.title")}
            </h5>
            <div className="text-sm text-gray-500 mb-4 leading-relaxed font-qs-medium">
              <Trans i18nKey="backup.import.desc">
                支持与现有数据 <b>合并</b> 或 <b>完全覆盖</b>。
              </Trans>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-lime-700 font-qs-semibold">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                {t("backup.import.warning")}
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
              className="px-4 py-2 bg-lime-50 text-lime-700 text-sm font-qs-semibold rounded border border-lime-200 hover:bg-lime-100 hover:border-lime-300 transition-all active:scale-95"
            >
              {t("backup.import.btn")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
