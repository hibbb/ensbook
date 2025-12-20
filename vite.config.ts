import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 确保对 BigInt 等 Web3 必备语法的原生支持
    target: "esnext",
  },
});
