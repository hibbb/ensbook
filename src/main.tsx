// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";

import { config } from "./wagmi";
import { connectKitTheme } from "./config/connectKitTheme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 全局默认配置
      // 1. 保持现状
      staleTime: 1000 * 60,
      // 2. 建议：在窗口重新聚焦时，强制刷新关键数据
      // 理由：用户可能去 Rainbow 钱包转账了，切回来时希望看到最新状态
      refetchOnWindowFocus: true, // 你目前设的是 false，建议改为 true 或针对特定 Query 开启
      // 3. 建议：网络恢复时自动刷新
      refetchOnReconnect: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider customTheme={connectKitTheme}>
          <App />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
