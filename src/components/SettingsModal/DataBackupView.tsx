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
import { getStoredMemos, saveStoredMemos } from "../../services/storage/memos";
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
    // ... (逻辑保持不变)
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
        const newMemos = json.data.memos || {};
        const currentLabels = getStoredLabels();
        const currentMemos = getStoredMemos();

        const mode = window.confirm(
          `检测到备份文件中包含 ${newLabels.length} 个域名。\n\n点击【确定】进行“合并” (保留现有数据并去重)\n点击【取消】进行“覆盖” (清空现有数据并替换)`,
        );

        let finalLabels: string[];
        if (mode) {
          finalLabels = Array.from(new Set([...currentLabels, ...newLabels]));
          saveStoredMemos({ ...currentMemos, ...newMemos });
        } else {
          if (
            !window.confirm("⚠️ 警告：这将清空您当前的所有数据！确定要覆盖吗？")
          ) {
            return;
          }
          finalLabels = newLabels;
          saveStoredMemos(newMemos);
        }

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
    e.target.value = "";
  };

  return (
    <div className="space-y-0 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* 导出区块：扁平化设计 */}
      <section className="py-4 border-b border-gray-100 first:pt-0">
        <div className="flex items-start gap-5">
          {/* 图标直接显示，无背景容器 */}
          <div className="mt-1 text-link text-xl">
            <FontAwesomeIcon icon={faDownload} />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-qs-bold text-gray-900 mb-1">
              备份数据
            </h5>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed font-qs-medium">
              生成包含您所有关注域名及备注的 JSON 文件。
              <span className="ml-2 text-gray-400 font-qs-regular">
                (当前: {getStoredLabels().length} 个)
              </span>
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-text-main text-sm font-qs-bold rounded hover:bg-gray-200 transition-colors active:scale-95"
            >
              下载备份 (.json)
            </button>
          </div>
        </div>
      </section>

      {/* 导入区块：扁平化设计 */}
      <section className="py-6">
        <div className="flex items-start gap-5">
          <div className="mt-1 text-lime-600 text-xl">
            <FontAwesomeIcon icon={faUpload} />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-qs-bold text-gray-900 mb-1">
              恢复数据
            </h5>
            <div className="text-sm text-gray-500 mb-4 leading-relaxed font-qs-medium">
              支持与现有数据 <b>合并</b> 或 <b>完全覆盖</b>。
              <div className="flex items-center gap-1.5 mt-2 text-xs text-lime-700 font-qs-bold">
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
              className="px-4 py-2 bg-lime-50 text-lime-700 text-sm font-qs-bold rounded border border-lime-200 hover:bg-lime-100 hover:border-lime-300 transition-all active:scale-95"
            >
              选择备份文件
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
