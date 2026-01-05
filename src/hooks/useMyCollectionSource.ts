// src/hooks/useMyCollectionSource.ts

import { useState, useEffect } from "react";
import { getMyCollectionSource } from "../services/storage/userStore";

/**
 * 响应式获取用户自定义集合源字符串
 *
 * 功能：
 * 1. 初始化读取
 * 2. 监听当前标签页的更新事件 (user-settings-updated)
 * 3. 监听跨标签页的存储事件 (storage)
 */
export const useMyCollectionSource = () => {
  const [source, setSource] = useState(getMyCollectionSource());

  useEffect(() => {
    const handleUpdate = () => {
      setSource(getMyCollectionSource());
    };

    // 1. 监听当前标签页的更新 (由 userStore 触发)
    window.addEventListener("user-settings-updated", handleUpdate);

    // 2. 监听跨标签页的更新 (浏览器原生机制)
    // 当用户在 Tab A 修改设置，Tab B 会收到此事件
    window.addEventListener("storage", (e) => {
      if (e.key === "ensbook_user_data_v1") {
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener("user-settings-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return source;
};
