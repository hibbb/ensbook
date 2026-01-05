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

// 🚀 新增：获取 Author URL 的辅助函数
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
    // 🚀 新增：一个简单的自定义插件来处理 HTML 转换
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
  define: {
    // 定义全局常量，注意字符串需要 JSON.stringify 包裹
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_NAME__: JSON.stringify(packageJson.displayName || packageJson.name),
    // 🚀 1. 注入清洗后的源码地址 (供 "GitHub" 链接使用)
    __APP_REPO_URL__: JSON.stringify(getRepoUrl(packageJson.repository)),
    __APP_HOMEPAGE__: JSON.stringify(packageJson.homepage),
    // 🚀 新增：注入作者链接常量
    __APP_AUTHOR_URL__: JSON.stringify(getAuthorUrl(packageJson.author)),
  },
});
