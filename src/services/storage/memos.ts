// src/services/storage/memos.ts

const MEMO_STORAGE_KEY = "ensbook_memos";

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
  if (!content.trim()) {
    delete memos[label]; // 如果内容为空，则删除 key
  } else {
    memos[label] = content.trim();
  }
  saveStoredMemos(memos);
};
