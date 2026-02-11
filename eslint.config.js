// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default [
  // 1. 忽略列表
  { ignores: ["dist"] },

  // 2. 基础配置
  js.configs.recommended,

  // 3. TypeScript 配置 (使用数组展开符)
  ...tseslint.configs.recommended,

  // 4. React 逻辑配置
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    // 匹配 commitlint.config.cjs, tailwind.config.js 等
    files: ["**/*.cjs", "**/*.js"],
    languageOptions: {
      // 启用 Node.js 全局变量 (解决 'module' is not defined)
      globals: globals.node,
    },
    rules: {
      // 允许使用 require (解决 @typescript-eslint/no-require-imports)
      "@typescript-eslint/no-require-imports": "off",
      // 关闭未定义检查 (允许 module, require 等)
      "no-undef": "off",
    },
  },
];
