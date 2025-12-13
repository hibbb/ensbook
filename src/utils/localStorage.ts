// src/utils/localStorage.ts

import { type EnsNameList } from "../types/ens"; // 确保路径正确

// 定义 LocalStorage 中存储 ENS 列表的键名
const ENS_LIST_STORAGE_KEY = "ens_name_list";

/**
 * 1. 从 LocalStorage 中读取并解析用户的 ENS 名称列表。
 * @returns EnsNameList | null 如果存在有效的列表则返回，否则返回 null。
 */
export function loadEnsNameList(): EnsNameList | null {
  try {
    if (typeof window === "undefined") {
      return null; // 确保在服务端渲染 (SSR) 环境下不报错
    }

    const serializedList = localStorage.getItem(ENS_LIST_STORAGE_KEY);

    if (serializedList === null) {
      return null; // 键不存在
    }

    // 解析 JSON 字符串，并断言类型
    const parsedList = JSON.parse(serializedList);

    // 简单的类型检查：确保它是一个数组
    if (Array.isArray(parsedList)) {
      return parsedList as EnsNameList;
    }

    return null; // 解析后不是数组
  } catch (error) {
    console.error("Error loading ENS name list from LocalStorage:", error);
    return null; // 发生解析错误时返回 null
  }
}

/**
 * 2. 将最新的 ENS 名称列表存储到 LocalStorage 中。
 * @param list 要存储的 EnsNameList 数组。
 */
export function saveEnsNameList(list: EnsNameList): void {
  try {
    if (typeof window === "undefined") {
      return;
    }

    const serializedList = JSON.stringify(list);
    localStorage.setItem(ENS_LIST_STORAGE_KEY, serializedList);
  } catch (error) {
    // 可能是 Quota Exceeded Error (存储空间不足，尽管不太可能)
    console.error("Error saving ENS name list to LocalStorage:", error);
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
