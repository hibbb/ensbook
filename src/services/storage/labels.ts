// src/utils/storage/labels.ts

const STORAGE_KEY_LABELS = "eb_user_labels";

const isBrowser = () => typeof window !== "undefined";

/**
 * 读取本地存储的 labels 列表
 * @returns 返回字符串数组，顺序与存储时一致
 */
export function getStoredLabels(): string[] {
  if (!isBrowser()) return [];
  try {
    const serialized = localStorage.getItem(STORAGE_KEY_LABELS);
    if (!serialized) return [];
    const parsed = JSON.parse(serialized);

    // 确保返回的是数组且内部全是字符串
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch (error) {
    console.warn("[Storage] 读取 labels 失败:", error);
    return [];
  }
}

/**
 * 保存 labels 列表到本地
 * @param labels 用户的原始输入标签数组
 */
export function saveStoredLabels(labels: string[]): void {
  if (!isBrowser()) return;
  try {
    // JSON.stringify 会自动保留数组的索引顺序
    localStorage.setItem(STORAGE_KEY_LABELS, JSON.stringify(labels));
  } catch (error) {
    console.warn("[Storage] 保存 labels 失败:", error);
  }
}

/**
 * 清空本地存储的 labels
 */
export function clearStoredLabels(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY_LABELS);
  } catch (error) {
    console.warn("[Storage] 清空 labels 失败:", error);
  }
}
