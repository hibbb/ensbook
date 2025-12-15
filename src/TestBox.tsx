// TestBox.tsx - 修正后

import EthPriceFeedAbi from "./abis/EthPriceFeed.json";
import { useReadContract } from "wagmi";
import { mainnet } from "wagmi/chains";
// 确保导入的 MAINNET_ADDRESSES 是正确的
import { MAINNET_ADDRESSES } from "./constants/addresses";

// 修正 1：重命名为 useGetEthPrice，使其成为有效的自定义 Hook
function useGetEthPrice() {
  return useReadContract({
    // 1. 传入合约地址
    address: MAINNET_ADDRESSES.ETH_PRICE_FEED,
    // 2. 传入 ABI
    abi: EthPriceFeedAbi,
    // 3. 传入函数名
    functionName: "latestAnswer",
    // 4. 确保参数列表是正确的，如果 latestAnswer 不需要参数，则删除 args
    // *注意：我删除了你原代码中的 'args: [node],' 因为 latestAnswer 通常不需要参数*
    chainId: mainnet.id,
  });
}

// 修正 2：移除 async 关键字，使其成为一个标准的 React Functional Component
export const TestBox = () => {
  // 在组件顶层调用 Hook
  const { data: ethPrice, isLoading, error } = useGetEthPrice();

  // 由于 ethPrice 是 BigInt 类型 (Viem/Wagmi 默认)，需要格式化
  // 假设这个 price feed 的 decimals 是 8 (Chainlink 常见)
  const formattedPrice = ethPrice
    ? (Number(ethPrice) / 10 ** 8).toFixed(2)
    : "...";

  if (isLoading) return <p>Loading ETH Price...</p>;
  if (error) return <p>Error loading price: {error.message}</p>;

  return (
    <div>
      <p>This is a test box.</p>
      <p>
        ETH/USD Price: <b>${formattedPrice}</b>
      </p>
      {/* 打印到控制台应该在副作用 Hook (useEffect) 中进行，但在组件渲染时打印数据也行 */}
      <pre>Raw Data: {ethPrice?.toString()}</pre>
    </div>
  );
};
