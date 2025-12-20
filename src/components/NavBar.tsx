// src/components/NavBar.tsx
import { Link } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

export const NavBar = () => {
  const { address, isConnected } = useAccount();

  // 获取钱包余额，仅在连接时启用
  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  return (
    <nav className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
      {/* 左侧：Logo 与 页面链接 */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tighter hover:text-blue-600 transition-colors"
        >
          eb <span className="text-gray-400 font-light text-base">ensbook</span>
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            解析器
          </Link>
          <Link
            to="/collection/999-club"
            className="hover:text-blue-600 transition-colors"
          >
            999 俱乐部
          </Link>
          <Link
            to="/collection/mnemonic-club"
            className="hover:text-blue-600 transition-colors"
          >
            助记词集合
          </Link>
        </div>
      </div>

      {/* 右侧：钱包状态与连接按钮 */}
      <div className="flex items-center gap-4">
        {isConnected && balance && (
          <span className="hidden sm:block text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {formatEther(balance.value).slice(0, 6)} ETH
          </span>
        )}
        <ConnectKitButton />
      </div>
    </nav>
  );
};
