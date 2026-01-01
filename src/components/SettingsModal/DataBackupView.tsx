// src/components/SettingsModal/DataBackupView.tsx

import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faUpload,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import {
  getStoredLabels,
  saveStoredLabels,
} from "../../services/storage/labels";
import { getStoredMemos, saveStoredMemos } from "../../services/storage/memos"; // 🚀 引入
import { exportBackup, validateBackup } from "../../utils/dataManagement";

interface DataBackupViewProps {
  onClose: () => void;
}

export const DataBackupView = ({ onClose }: DataBackupViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const labels = getStoredLabels();
    if (labels.length === 0) {
      toast.error("当前列表为空，无需导出");
      return;
    }
    try {
      exportBackup(labels);
      toast.success(`成功导出 ${labels.length} 个域名`);
    } catch (e) {
      console.error(e);
      toast.error("导出失败");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!validateBackup(json)) {
          toast.error("无效的备份文件格式");
          return;
        }

        const newLabels = json.data.labels;
        // 🚀 读取并合并备注
        const newMemos = json.data.memos || {};

        const currentLabels = getStoredLabels();
        const currentMemos = getStoredMemos();

        // 交互确认
        const mode = window.confirm(
          `检测到备份文件中包含 ${newLabels.length} 个域名。\n\n点击【确定】进行“合并” (保留现有数据并去重)\n点击【取消】进行“覆盖” (清空现有数据并替换)`,
        );

        let finalLabels: string[];
        if (mode) {
          // 合并模式
          finalLabels = Array.from(new Set([...currentLabels, ...newLabels]));
          // 🚀 合并备注
          saveStoredMemos({ ...currentMemos, ...newMemos });
        } else {
          // 覆盖模式 (再次确认)
          if (
            !window.confirm("⚠️ 警告：这将清空您当前的所有数据！确定要覆盖吗？")
          ) {
            return;
          }
          finalLabels = newLabels;
          // 🚀 覆盖备注
          saveStoredMemos(newMemos);
        }

        // 保存并刷新
        saveStoredLabels(finalLabels);

        toast.success("导入成功！正在刷新...");
        setTimeout(() => window.location.reload(), 1000);
        onClose();
      } catch (err) {
        console.error(err);
        toast.error("文件解析失败");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // 重置 input
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* 导出区块 */}
      <section>
        <h5 className="text-sm font-qs-bold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-link rounded-full"></div>
          备份数据
        </h5>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 transition-colors hover:border-blue-100">
          <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm text-link border border-gray-100">
              <FontAwesomeIcon icon={faDownload} size="lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-3 leading-relaxed font-qs-medium">
                生成包含您所有关注域名及备注的 JSON 备份文件。
                <br />
                <span className="text-xs text-gray-400 mt-1 inline-block font-qs-regular">
                  当前包含 {getStoredLabels().length} 个关注域名
                </span>
              </p>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-gray-200 text-text-main text-sm font-qs-bold rounded-lg shadow-sm hover:border-link hover:text-link transition-all active:scale-95"
              >
                下载备份 (.json)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 导入区块 */}
      <section>
        <h5 className="text-sm font-qs-bold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-lime-400 rounded-full"></div>
          恢复数据
        </h5>
        <div className="bg-lime-50/30 rounded-xl p-4 border border-lime-100 transition-colors hover:border-lime-200">
          <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm text-lime-600 border border-lime-50">
              <FontAwesomeIcon icon={faUpload} size="lg" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-3 leading-relaxed font-qs-medium">
                恢复您的数据。支持与现有数据 <b>合并</b> 或 <b>完全覆盖</b>。
                <div className="flex items-center gap-1.5 mt-2 text-xs text-lime-700/80 bg-lime-50 w-fit px-2 py-1 rounded font-qs-bold">
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  请确保导入的是合法的 EnsBook 备份文件
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
                className="px-4 py-2 bg-lime-500 text-white text-sm font-qs-bold rounded-lg shadow-sm shadow-lime-200 hover:bg-lime-600 transition-all active:scale-95"
              >
                选择备份文件
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
