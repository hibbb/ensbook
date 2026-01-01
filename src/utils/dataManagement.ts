// src/utils/dataManagement.ts

import type { EnsBookBackup } from "../types/backup";

// 导出功能
export const exportBackup = (labels: string[]) => {
  // 🚀 TODO: 等待备注功能开发完成后，在这里读取真实的备注数据
  // const memos = getStoredMemos();
  const memos = {};

  const backup: EnsBookBackup = {
    version: 1,
    timestamp: Date.now(),
    source: "EnsBook",
    data: {
      labels,
      memos,
      // settings: ... // 未来扩展
    },
  };

  // 创建 Blob
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  // 生成文件名 (例如: ensbook-backup-2023-10-27.json)
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `ensbook-backup-${dateStr}.json`;

  // 触发下载
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

// 导入校验
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateBackup = (json: any): json is EnsBookBackup => {
  return (
    json &&
    json.source === "EnsBook" &&
    json.version === 1 &&
    json.data &&
    Array.isArray(json.data.labels)
  );
};
