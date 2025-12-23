// src/components/NavBar.tsx
import { Link } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

export const NavBar = () => {
  const { address, isConnected } = useAccount();

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  return (
    // 🚀 使用语义化边框色 table-border
    <nav className="flex justify-between items-center mb-10 pb-6 border-b border-table-border">
      {/* 左侧：Logo 与 页面链接 */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          // 🚀 使用语义化链接色 link
          className="text-2xl font-bold tracking-tighter hover:text-link transition-colors"
        >
          eb <span className="text-gray-400 font-light text-base">ensbook</span>
        </Link>

        {/* 🚀 移除 text-gray-600，默认继承 App.tsx 的 text-text-main */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-link transition-colors">
            解析器
          </Link>
          <Link
            to="/collection/999-club"
            className="hover:text-link transition-colors"
          >
            999 俱乐部
          </Link>
          <Link
            to="/collection/mnemonic-club"
            className="hover:text-link transition-colors"
          >
            助记词集合
          </Link>
        </div>
      </div>

      {/* 右侧：钱包状态与连接按钮 */}
      <div className="flex items-center gap-4">
        {isConnected && balance && (
          // 🚀 背景色使用 table-header，保持视觉统一
          <span className="hidden sm:block text-xs font-mono text-gray-500 bg-table-header px-2 py-1 rounded">
            {formatEther(balance.value).slice(0, 6)} ETH
          </span>
        )}
        <ConnectKitButton />
      </div>
    </nav>
  );
};
