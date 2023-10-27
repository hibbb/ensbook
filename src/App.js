import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './assets/css/App.css';
import ENSBook from './ENSBook';
import { useTranslation } from 'react-i18next';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { goerli, mainnet } from 'wagmi/chains'

// 1. Get projectId
const projectId = '874c843cfae3946d6543580b683a1047'

// 2. Create wagmiConfig
const metadata = {
  name: 'ENSBook',
  description: 'ENSBook is a lightweight tool used for observing, registering or renewing ENS names.',
  url: 'https://ensbook.xyz/',
  icons: ['https://ensbook.xyz/img/favicon.png']
}

const chains = [mainnet, goerli]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
const bookModal = createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-font-family': 'ebr-semibold',
    '--w3m-color-mix': '#0dcaf0',
    '--w3m-color-mix-strength': 0,
    '--w3m-border-radius-master': '1px'
  }
})


export default function App() {
  const { t } = useTranslation();
  return (
    <WagmiConfig config={wagmiConfig}>
      <ENSBook t={t} bookModal={bookModal} />
    </WagmiConfig>
  )
}
