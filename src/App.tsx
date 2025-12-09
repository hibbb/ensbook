// src/App.tsx
import { ConnectKitButton } from 'connectkit'
import { useAccount, useBalance } from 'wagmi'

export default function App() {
  const { address, isConnected } = useAccount()

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  })

  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h2>⚡ Web3 + React + Vite + ConnectKit Template</h2>

      {/* Connect / Disconnect 按钮 */}
      <ConnectKitButton />

      {isConnected && (
        <>
          <div>Address: {address}</div>
          <div>Balance: {balance?.formatted} ETH</div>
        </>
      )}
    </div>
  )
}
