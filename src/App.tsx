// src/App.tsx
import { ConnectKitButton } from "connectkit";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { Toaster } from "react-hot-toast";
import { TestBox } from "./TestBox";

export default function App() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <h2>Web3 + React + Vite + ConnectKit Template</h2>

      {/* Connect / Disconnect 按钮 */}
      <ConnectKitButton />

      {isConnected && (
        <>
          <div>Address: {address}</div>
          <div>Balance: {formatEther(balance?.value ?? 0n)} ETH</div>
        </>
      )}

      <hr />
      <TestBox />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          // 全局默认样式设置
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}
