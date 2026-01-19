/// <reference types="vite/client" />

interface ImportMetaEnv {
  // -------------------------------------------------------------
  // 强制要求以下环境变量为 string 类型
  // -------------------------------------------------------------

  /** WalletConnect 项目 ID */
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string;

  /** Infura 或其他 RPC 服务的 API Key */
  readonly VITE_INFURA_API_KEY: string;

  /** The Graph Subgraph API Key */
  readonly VITE_SUBGRAPH_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 定义全局常量的类型
declare const __APP_VERSION__: string;
declare const __APP_NAME__: string;
declare const __APP_DESCRIPTION__: string;
declare const __APP_REPO_URL__: string; // 清洗后的 GitHub 地址
declare const __APP_HOMEPAGE__: string; // 应用访问地址
declare const __APP_AUTHOR_URL__: string;
