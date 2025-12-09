// src/wagmi.ts
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { getDefaultConfig } from 'connectkit'

// 去 https://cloud.reown.com or walletconnect.com 注册免费 projectId
const projectId = '874c843cfae3946d6543580b683a1047'

export const config = createConfig(
  getDefaultConfig({
    appName: 'My Web3 App',
    walletConnectProjectId: projectId,
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(),
    },
  })
)
