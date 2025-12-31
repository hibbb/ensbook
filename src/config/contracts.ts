// src/config/contracts.ts
import { mainnet, sepolia } from "viem/chains";
import { type Address } from "viem";

export interface ContractAddresses {
  ETH_REGISTRAR: Address;
  ETH_CONTROLLER_V3: Address;
  BULK_RENEWAL: Address;
  ENS_NAME_WRAPPER: Address;
  ENS_PUBLIC_RESOLVER: Address;
  ENS_PREMIUM_PRICE: Address;
  ETH_PRICE_FEED: Address;
}

// 主网地址配置
// 注意：只要字符串符合 0x 开头且格式正确，TS 会自动判定它符合 Address 类型
export const MAINNET_ADDR: ContractAddresses = {
  ETH_REGISTRAR: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
  ETH_CONTROLLER_V3: "0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547",
  BULK_RENEWAL: "0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035",
  ENS_NAME_WRAPPER: "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401",
  ENS_PUBLIC_RESOLVER: "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
  ENS_PREMIUM_PRICE: "0x7542565191d074ce84fbfa92cae13acb84788ca9",
  ETH_PRICE_FEED: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
};

// Sepolia 测试网地址配置
const SEPOLIA_ADDR: ContractAddresses = {
  ETH_REGISTRAR: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
  ETH_CONTROLLER_V3: "0xfb3cE5D01e0f33f41DbB39035dB9745962F1f968",
  BULK_RENEWAL: "0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035", // 待修改
  ENS_NAME_WRAPPER: "0x0635513f179D50A207757E05759CbD106d7dFcE8",
  ENS_PUBLIC_RESOLVER: "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD",
  ENS_PREMIUM_PRICE: "0x6810DbCE73C67506f785A225F818b30D8f209AAb",
  ETH_PRICE_FEED: "0x10E7e7D64d7dA687f7DcF8443Df58A0415329b15",
};

/**
 * 根据 Chain ID 获取合约地址
 */
export const getContracts = (
  chainId: number = mainnet.id,
): ContractAddresses => {
  switch (chainId) {
    case sepolia.id:
      return SEPOLIA_ADDR;
    case mainnet.id:
    default:
      return MAINNET_ADDR;
  }
};
