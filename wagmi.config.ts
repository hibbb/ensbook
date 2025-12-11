import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { type Address } from "viem";

// 1. 动态导入 constants/addresses.ts 文件，获取常量
// 注意：由于 Node.js 默认不支持直接导入 .ts 文件，我们依赖于 ts-node 或 Vite 的配置
// 在 wagmi.config.ts 中，使用 dynamic import 是最可靠的跨平台方式。
const { MAINNET_ADDRESSES } = await import("./src/constants/addresses.ts");

// 确保导入的地址结构与你之前提供的对象结构一致
const MAINNET_ADDRESSES_RECORDS: Record<string, Address> =
  MAINNET_ADDRESSES as Record<string, Address>;

export default defineConfig({
  out: "src/wagmi-generated/index.ts",

  contracts: [
    // --- 核心 ENS 合约 ---
    {
      name: "EnsRegistrar",
      abi: (await import("./src/abis/EnsRegistrar.json")).default,
      address: { 1: MAINNET_ADDRESSES_RECORDS.ENS_REGISTRAR },
    },
    {
      name: "EnsBulkRenewal",
      abi: (await import("./src/abis/EnsBulkRenewal.json")).default,
      address: { 1: MAINNET_ADDRESSES_RECORDS.ENS_BULK_RENEWAL },
    },
    {
      name: "EnsControllerV3",
      abi: (await import("./src/abis/EnsControllerV3.json")).default,
      address: { 1: MAINNET_ADDRESSES_RECORDS.ENS_CONTROLLER_V3 },
    },

    // --- Chainlink 价格喂价 ---
    {
      name: "EthUsdPriceFeed",
      abi: (await import("./src/abis/EthUsdPriceFeed.json")).default,
      address: { 1: MAINNET_ADDRESSES_RECORDS.ETH_USD_PRICE_FEED },
    },
  ],

  plugins: [react()],
});
