/// <reference types="vite/client" />

interface ImportMetaEnv {
  // -------------------------------------------------------------
  // 强制要求以下环境变量为 string 类型
  // -------------------------------------------------------------

  /** WalletConnect 项目 ID */
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string;

  /** Infura 或其他 RPC 服务的 API Key */
  readonly VITE_INFURA_API_KEY: string;

  /** ENS 注册推荐人哈希 */
  readonly VITE_ENS_REFERRER_HASH: string;

  /** The Graph Subgraph API Key */
  readonly VITE_SUBGRAPH_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
