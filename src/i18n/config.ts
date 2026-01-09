// src/i18n/config.ts

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getUserSettings } from "../services/storage/userStore";

// 引入语言包 (后续我们会逐步填充这两个文件)
import en from "./locales/en.json";
import zh from "./locales/zh.json";

// 获取用户存储的设置
const settings = getUserSettings();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  // 优先使用用户设置的语言，如果没有则回退到 'en'
  lng: settings.locale || "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false, // React 默认已防范 XSS，无需再次转义
  },

  // 开发阶段开启 debug 可以看到语言加载日志，上线前改为 false
  debug: import.meta.env.DEV,
});

export default i18n;
