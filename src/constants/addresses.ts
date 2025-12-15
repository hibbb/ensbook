import { type Address } from "viem";

// 定义主网 (Mainnet) 上的核心地址
export const MAINNET_ADDRESSES = {
  ENS_REGISTRAR: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85" as Address,
  ENS_PUBLIC_RESOLVER: "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63" as Address,
  ENS_BULK_RENEWAL: "0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035" as Address,
  ENS_NAME_WRAPPER: "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401" as Address,
  ENS_CONTROLLER_V3: "0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547" as Address,
  ENS_PREMIUM_PRICE: "0x7542565191d074ce84fbfa92cae13acb84788ca9" as Address,

  // ETH/USD 价格喂价合约地址
  ETH_USD_PRICE_FEED: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" as Address,
};

// 如果你支持其他链，可以创建另一个对象
export const SEPOLIA_ADDRESSES = {
  ENS_REGISTRY: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1E" as Address, // 通常与主网不同，需要查证
};

// 统一导出方便访问
export const CHAIN_ADDRESSES = {
  1: MAINNET_ADDRESSES, // 1 是 Mainnet 的 Chain ID
  11155111: SEPOLIA_ADDRESSES, // Sepolia Chain ID
  // ...
};
