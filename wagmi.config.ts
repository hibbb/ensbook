import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";

// 1. 动态导入新的配置中心
// 注意：这里我们使用 import() 动态加载，因为它是一个 TS 文件
const { MAINNET_ADDR } = await import("./src/config/contracts");

export default defineConfig({
  // 输出路径 (你可以根据喜好改为 src/generated.ts)
  out: "src/wagmi-generated/index.ts",

  contracts: [
    {
      name: "EthRegistrar",
      abi: (await import("./src/abis/EthRegistrar.json")).default,
      address: { 1: MAINNET_ADDR.ETH_REGISTRAR },
    },
    {
      name: "EthControllerV3",
      abi: (await import("./src/abis/EthControllerV3.json")).default,
      address: { 1: MAINNET_ADDR.ETH_CONTROLLER_V3 },
    },
    {
      name: "BulkRenewal",
      abi: (await import("./src/abis/BulkRenewal.json")).default,
      address: { 1: MAINNET_ADDR.BULK_RENEWAL },
    },
    // --- Chainlink 价格喂价 ---
    {
      name: "EthPriceFeed",
      abi: (await import("./src/abis/EthPriceFeed.json")).default,
      address: { 1: MAINNET_ADDR.ETH_PRICE_FEED },
    },
  ],

  plugins: [react()],
});
