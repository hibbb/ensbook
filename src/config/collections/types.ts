// src/config/collections/types.ts

/**
 * ENS 集合定义接口
 */
export interface EnsCollection {
  id: string; // 唯一标识符，如 '999-club'
  displayName: string; // UI 显示名称
  description: string; // 集合描述
  labels: string[]; // 静态 labels 数组
}
