// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";

import { config } from "./wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 全局默认配置
      staleTime: 1000 * 60, // 数据 1 分钟内认为是新鲜的，不重新请求
      refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新 (根据需求开启)
      retry: 1, // 失败后重试 1 次
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <App />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
