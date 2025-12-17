// src/utils/localStorage.ts

import { type NameRecords } from "../types/ens";

// 追求极致简洁，假设在本项目命名空间内是唯一的
const NAME_RECORDS_STORAGE_KEY = "ens_name_records";

/**
 * 1. 从浏览器本地存储加载名称记录
 */
export function loadNameRecords(): NameRecords | null {
  if (typeof window === "undefined") return null;

  try {
    const serialized = localStorage.getItem(NAME_RECORDS_STORAGE_KEY);
    if (!serialized) return null;

    const parsed = JSON.parse(serialized);

    // 检查是否为数组，以确保数据格式正确
    return Array.isArray(parsed) ? (parsed as NameRecords) : null;
  } catch (error) {
    console.error("从本地存储加载名称记录时发生错误:", error);
    return null;
  }
}

/**
 * 2. 将名称记录保存到浏览器本地存储
 */
export function saveNameRecords(records: NameRecords): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(NAME_RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("保存名称记录到本地存储时发生错误:", error);
  }
}

/**
 * 3. 使用示例。
 */
// import { loadEnsNameList, saveEnsNameList } from '../utils/localStorage';
// import { EnsNameList, EnsNameRecord } from '../types/ens';

// // 组件或 Hook 内部
// const existingList = loadEnsNameList();

// if (existingList) {
//     console.log("Loaded names:", existingList.length);
// }

// // 假设你获取了一个新的名称记录
// const newRecord: EnsNameRecord = { /* ... 你的数据 ... */ };

// // 更新列表并保存
// const updatedList: EnsNameList = existingList ? [...existingList, newRecord] : [newRecord];

// saveEnsNameList(updatedList);
