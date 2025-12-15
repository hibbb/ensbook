// src/wagmi.ts

import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

// 安全地从环境变量中读取密钥
const WALLET_CONNECT_PROJECT_ID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID;
const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY;

// 健壮性检查：输出警告并回退
if (!INFURA_API_KEY || !WALLET_CONNECT_PROJECT_ID) {
  console.error(
    "Warning: VITE_INFURA_API_KEY or VITE_WALLET_CONNECT_PROJECT_ID is not set. Falling back to public RPCs.",
  );
}

// 核心修改点：构建 Infura Transports
const infuraTransport = INFURA_API_KEY
  ? http(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`)
  : http(); // 如果没有 Key，就使用默认的公共 RPC URL

export const config = createConfig(
  getDefaultConfig({
    appName: "ENSBook",

    // 使用新的大写常量名
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,

    // 明确列出你希望应用支持的所有链 (尽管你只支持 mainnet，但 connectkit 默认配置了 sepolia，这里保持原样)
    chains: [mainnet, sepolia],

    // 配置 transports
    transports: {
      // **主网 (Mainnet) 必须使用 Infura URL**
      [mainnet.id]: infuraTransport,

      // 测试网 Sepolia 的配置
      [sepolia.id]: INFURA_API_KEY
        ? http(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`)
        : http(),

      // 其他链如果有，也在这里配置
    },
  }),
);
