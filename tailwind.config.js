/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // 确保包含所有可能使用 Tailwind 类名的文件
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 'sans' 是默认字体，如果你想全局替换默认字体，可以覆盖它
        // 或者定义一个新的别名
        custom: ["qs-regular", "Inter", "system-ui", "sans-serif"],
        qsLight: ["qs-light", "Inter", "system-ui", "sans-serif"],
        qsMedium: ["qs-medium", "Inter", "system-ui", "sans-serif"],
        qsRegular: ["qs-regular", "Inter", "system-ui", "sans-serif"],
        qsSemiBold: ["qs-semibold", "Inter", "system-ui", "sans-serif"],
        qsBold: ["qs-bold", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
