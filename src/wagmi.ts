// src/wagmi.ts

import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";
import { ALCHEMY_API_KEY, WALLET_CONNECT_PROJECT_ID } from "./config/env";

// 健壮性检查：输出警告并回退
if (!WALLET_CONNECT_PROJECT_ID) {
  console.error(
    "Warning: VITE_WALLET_CONNECT_PROJECT_ID is not set. Falling back to public RPCs.",
  );
}

// 核心修改点：配置 Transport 并启用 Batch Multicall
const transportConfig = {
  batch: {
    multicall: true, // 启用 Multicall 聚合请求
    wait: 50, // 等待 50ms 收集请求（去抖动）
  },
};

const alchemyTransport = ALCHEMY_API_KEY
  ? http(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      transportConfig,
    )
  : http(undefined, transportConfig); // 即使是公共节点也建议开启，虽然公共节点限制更严

export const config = createConfig(
  getDefaultConfig({
    appName: __APP_NAME__,

    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,

    chains: [mainnet],

    transports: {
      [mainnet.id]: alchemyTransport,
    },
  }),
);
