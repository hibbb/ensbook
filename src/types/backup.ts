// src/types/backup.ts

export interface EnsBookBackup {
  version: number;
  timestamp: number;
  source: "ENSBook";
  data: {
    labels: string[]; // 关注列表
    memos?: Record<string, string>; // 域名备注
    settings?: {
      // 预留设置项
      theme?: "light" | "dark";
      locale?: "zh" | "en";
      defaultDuration?: number;
    };
  };
}
