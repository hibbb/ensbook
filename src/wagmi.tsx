// src/wagmi.ts

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains' // 导入所有你需要支持的链
import { getDefaultConfig } from 'connectkit'

// 安全地从环境变量中读取密钥
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY

if (!infuraApiKey || !projectId) {
  console.error("Warning: VITE_INFURA_API_KEY or VITE_WALLET_CONNECT_PROJECT_ID is not set. Falling back to public RPCs.");
}

// 核心修改点：构建 Infura Transports
const infuraTransport = infuraApiKey 
  ? http(`https://mainnet.infura.io/v3/${infuraApiKey}`)
  : http() // 如果没有 Key，就使用默认的公共 RPC URL

export const config = createConfig(
  getDefaultConfig({
    appName: 'ENSBook',
    walletConnectProjectId: projectId,
    
    // 明确列出你希望应用支持的所有链
    chains: [mainnet, sepolia], 
    
    // 配置 transports
    transports: {
      // **主网 (Mainnet) 必须使用 Infura URL**
      [mainnet.id]: infuraTransport,
      
      // 如果你支持测试网，也建议配置 Infura 的测试网 URL
      [sepolia.id]: infuraApiKey
        ? http(`https://sepolia.infura.io/v3/${infuraApiKey}`)
        : http(),
        
      // 其他链如果有，也在这里配置
    },
  })
)