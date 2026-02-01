import forms from "@tailwindcss/forms"; // 🚀 改用 import

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Sans 保持 Quicksand
        sans: ['"Quicksand"', "ui-sans-serif", "system-ui", "sans-serif"],

        // 🚀 修改：Mono 改为 DM Mono
        mono: [
          '"DM Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
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
