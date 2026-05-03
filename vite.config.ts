import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";

// 🔧 辅助函数：清洗 Git URL
// 将 "git+https://github.com/..." 转换为 "https://github.com/..."
// 修复：将 any 替换为具体的联合类型 string | { url: string } | undefined
const getRepoUrl = (url: string | { url: string } | undefined) => {
  // 处理字符串情况
  if (typeof url === "string") return url.replace(/^git\+/, "");

  // 处理对象情况 (使用 in 运算符进行类型收窄，并确保 url 不为 null)
  if (typeof url === "object" && url !== null && "url" in url) {
    return url.url.replace(/^git\+/, "");
  }

  return "";
};

// 获取 Author URL 的辅助函数
const getAuthorUrl = (author: string | { url?: string } | undefined) => {
  if (typeof author === "object" && author !== null && "url" in author) {
    return author.url;
  }
  return "";
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 一个简单的自定义插件来处理 HTML 转换
    {
      name: "html-transform",
      transformIndexHtml(html) {
        // 读取 package.json 中的 displayName 或 name
        const title = packageJson.displayName || packageJson.name;
        // 将 HTML 中的 %APP_TITLE% 替换为真实标题
        return html.replace(/%APP_TITLE%/g, title);
      },
    },
  ],
  // 新增：解析配置
  resolve: {
    alias: {
      // 告诉 Vite：遇到 "events" 导入时，指向 node_modules 中的 "events" 包
      events: "events",
    },
  },
  define: {
    // 定义全局常量，注意字符串需要 JSON.stringify 包裹
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_NAME__: JSON.stringify(packageJson.displayName || packageJson.name),
    __APP_REPO_URL__: JSON.stringify(getRepoUrl(packageJson.repository)),
    __APP_HOMEPAGE__: JSON.stringify(packageJson.homepage),
    __APP_AUTHOR_URL__: JSON.stringify(getAuthorUrl(packageJson.author)),
    // 建议：Web3 项目通常还需要这个 Polyfill，防止某些库报错
    // 如果你之后遇到 "global is not defined" 错误，请取消下面这行的注释
    // global: "globalThis",
  },
  build: {
    sourcemap: false, // 生产环境关闭源码映射
    // 建议：为了兼容某些老旧的加密库 (CommonJS)，有时需要调大 chunk 大小警告
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // 确保 external 不包含 events，虽然 alias 通常优先级更高，但以防万一
    },
  },
});
