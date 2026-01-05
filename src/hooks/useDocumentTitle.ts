// src/hooks/useDocumentTitle.ts

import { useEffect } from "react";

/**
 * 动态更新页面标题 Hook
 * @param pageTitle - 当前页面的标题（可选）。如果不传，则重置为 App 名称。
 */
export const useDocumentTitle = (pageTitle?: string) => {
  useEffect(() => {
    // 获取全局注入的 App 名称 (ENSBook)
    const appName = __APP_NAME__;

    if (pageTitle) {
      // 格式：ENSBook - 999 Club
      document.title = `${appName} - ${pageTitle}`;
    } else {
      // 默认格式：ENSBook
      document.title = appName;
    }
  }, [pageTitle]);
};
