// src/types/backup.ts

import type { EnsBookUserData } from "./userData";

/**
 * 备份文件结构
 */
export interface EnsBookBackup extends EnsBookUserData {
  source: "ENSBook";
}
