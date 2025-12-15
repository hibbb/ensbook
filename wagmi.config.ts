import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { type Address } from "viem";

// 1. 动态导入 constants/addresses.ts 文件，获取常量
const { MAINNET_ADDRESSES } = await import("./src/constants/addresses.ts");

const MAINNET_ADDRESSES_RECORDS: Record<string, Address> =
  MAINNET_ADDRESSES as Record<string, Address>;

export default defineConfig({
  out: "src/wagmi-generated/index.ts",

  contracts: [
    {
      name: "EthRegistrar",
      abi: (await import("./src/abis/EthRegistrar.json")).default,
      address: { 1: MAINNET_ADDRESSES_RECORDS.ETH_REGISTRAR },
    },
    {
      name: "EthControllerV3",
      abi: (await import("./src/abis/EthControllerV3.json")).default,
      address: { 1: MAINNET_ADDRESSES_RECORDS.ETH_CONTROLLER_V3 },
    },
    {
      // 对应您原先的 BulkRenew
      name: "BulkRenewal",
      abi: (await import("./src/abis/BulkRenewal.json")).default,
      address: { 1: MAINNET_ADDRESSES_RECORDS.BULK_RENEWAL },
    },

    // --- Chainlink 价格喂价 ---
    {
      // 对应您原先的 ETHPriceFeed
      name: "EthPriceFeed",
      abi: (await import("./src/abis/EthPriceFeed.json")).default,
      address: { 1: MAINNET_ADDRESSES_RECORDS.ETH_PRICE_FEED },
    },
  ],

  plugins: [react()],
});
