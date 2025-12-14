/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // 确保包含所有可能使用 Tailwind 类名的文件
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
