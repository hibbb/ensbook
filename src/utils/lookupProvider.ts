// src/utils/lookupProvider.ts
import type { NameRecord } from "../types/ensNames";
import { getContracts } from "../config/contracts";
import * as ensUtils from "./ens";

/**
 * 外部链接项定义接口
 * 增加 chainId 参数支持，以实现动态地址解析
 */
interface LookupItem {
  key: string;
  label: string;
  getLink: (record: NameRecord, chainId?: number) => string;
  shouldShow: (record: NameRecord, chainId?: number) => boolean;
}

/**
 * 辅助函数：获取 TokenID 的十进制字符串
 */
const getTokenId = (record: NameRecord): string => {
  const hex = record.wrapped ? record.namehash : record.labelhash;
  return BigInt(hex).toString();
};

/**
 * 🚀 声明式链接配置 (动态版)
 */
export const LOOKUP_LINKS: LookupItem[] = [
  {
    key: "Web3bio",
    label: "Web3.bio",
    // 逻辑：仅在主网且域名已注册时显示
    shouldShow: (r, cid) =>
      ensUtils.isMainnet(cid) && ensUtils.isRenewable(r.status),
    getLink: (r) => `https://web3.bio/${r.label}.eth`,
  },
  {
    key: "EtherScan",
    label: "Etherscan",
    shouldShow: (r) => !ensUtils.isAvailable(r.status),
    getLink: (r, cid) => {
      const addr = getContracts(cid); // 🚀 动态获取合约地址
      const contract = r.wrapped ? addr.ENS_NAME_WRAPPER : addr.ETH_REGISTRAR;
      const baseUrl = ensUtils.isMainnet(cid)
        ? "https://etherscan.io"
        : "https://sepolia.etherscan.io";
      return `${baseUrl}/nft/${contract}/${getTokenId(r)}`;
    },
  },
  {
    key: "Opensea",
    label: "OpenSea",
    // 仅在主网显示
    shouldShow: (r, cid) =>
      ensUtils.isMainnet(cid) && ensUtils.isRenewable(r.status),
    getLink: (r, cid) => {
      const addr = getContracts(cid);
      const contract = r.wrapped ? addr.ENS_NAME_WRAPPER : addr.ETH_REGISTRAR;
      return `https://opensea.io/assets/ethereum/${contract}/${getTokenId(r)}`;
    },
  },
  {
    key: "Grails",
    label: "Grails",
    shouldShow: (_, cid) => ensUtils.isMainnet(cid),
    getLink: (r) => `https://grails.app/${r.label}.eth`,
  },
  {
    key: "CheckTool",
    label: "Check Tool",
    shouldShow: (r) => ensUtils.isRenewable(r.status),
    getLink: (r) => `https://tools.ens.domains/check/${r.label}.eth`,
  },
  {
    key: "LinkETH",
    label: "Limo",
    shouldShow: (r) => ensUtils.isActive(r.status),
    getLink: (r) => `https://${r.label}.eth.limo/`,
  },
  {
    key: "DNSRelated",
    label: "DNS",
    shouldShow: () => true,
    getLink: (r) =>
      `https://instantdomainsearch.com/domain/extensions?q=${r.label}`,
  },
];

/**
 * 核心功能：根据 Record 和当前链 ID 过滤链接
 */
export const getAvailableLookups = (
  record: NameRecord,
  chainId?: number,
): LookupItem[] => {
  return LOOKUP_LINKS.filter((item) => item.shouldShow(record, chainId));
};
