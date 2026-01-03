// src/services/storage/memos.ts

const MEMO_STORAGE_KEY = "eb_user_memos";
// 🚀 定义最大长度常量，方便全局引用
export const MAX_MEMO_LENGTH = 200;

export type MemoMap = Record<string, string>;

export const getStoredMemos = (): MemoMap => {
  try {
    const raw = localStorage.getItem(MEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("读取备注失败", e);
    return {};
  }
};

export const saveStoredMemos = (memos: MemoMap) => {
  try {
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));
  } catch (e) {
    console.error("保存备注失败", e);
  }
};

export const getMemo = (label: string): string => {
  const memos = getStoredMemos();
  return memos[label] || "";
};

export const setMemo = (label: string, content: string) => {
  const memos = getStoredMemos();

  // 🚀 1. 强制截断：无论传入什么，只存前 200 个字
  const safeContent = content.trim().slice(0, MAX_MEMO_LENGTH);

  if (!safeContent) {
    delete memos[label];
  } else {
    memos[label] = safeContent;
  }

  // 🚀 2. 捕获 QuotaExceededError (爆仓保护)
  try {
    saveStoredMemos(memos);
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      // 这里可以抛出错误让 UI 层捕获，或者 console.error
      console.error("存储空间已满，无法保存备注");
      // 可以在这里触发一个全局的 toast.error("存储空间不足")，但这需要引入 toast
      throw new Error("存储空间不足");
    }
  }
};
