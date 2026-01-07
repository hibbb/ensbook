import forms from "@tailwindcss/forms"; // 🚀 改用 import

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // 🚀 技巧：覆盖默认的 'sans'，这样整个项目默认就会用 qs-regular，无需处处指定
        sans: ["qs-regular", "Inter", "system-ui", "sans-serif"],
        // 保留这些变体以备特殊需求
        "qs-light": ["qs-light", "sans-serif"],
        "qs-regular": ["qs-regular", "sans-serif"],
        "qs-medium": ["qs-medium", "sans-serif"],
        "qs-semibold": ["qs-semibold", "sans-serif"],
      },
      colors: {
        background: "#f5f5f5",
        link: "#0dcaf0",
        "link-hover": "#0aa2c0",
        "text-main": "#483c32",
        table: {
          header: "#eaeaea",
          row: "#ffffff",
          border: "#dddddd",
        },
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [forms],
};
