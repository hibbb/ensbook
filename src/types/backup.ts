// src/types/backup.ts

import type { EnsBookUserData } from "./userData";

/**
 * 备份文件结构
 * 直接复用核心数据结构，确保“所见即所得”的备份
 */
export interface EnsBookBackup extends EnsBookUserData {
  source: "ENSBook"; // 用于校验文件来源
}
