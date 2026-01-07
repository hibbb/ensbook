// src/utils/lookupProvider.ts
import type { NameRecord } from "../types/ensNames";
import { getContracts } from "../config/contracts";
import * as ensUtils from "./ens";

// 🚀 1. 静态引入所有图片资源
// Vite 会自动将这些 import 解析为构建后的 URL 字符串
import web3bioIcon from "../assets/lookups/web3bio-dark.svg";
import etherscanIcon from "../assets/lookups/etherscan-dark.svg";
import openseaIcon from "../assets/lookups/opensea-dark.svg";
import envisionIcon from "../assets/lookups/vision-light.svg";
import grailsIcon from "../assets/lookups/grails-light.png";
import limoIcon from "../assets/lookups/limo-dark.svg";
import dnsIcon from "../assets/lookups/dnssearch-dark.svg";

/**
 * 外部链接项定义接口
 */
interface LookupItem {
  key: string;
  getLabel: (record: NameRecord) => string;
  icon: string; // 🚀 2. 新增 icon 字段
  getLink: (record: NameRecord, chainId?: number) => string;
  shouldShow: (record: NameRecord, chainId?: number) => boolean;
}

const getTokenId = (record: NameRecord): string => {
  const hex = record.wrapped ? record.namehash : record.labelhash;
  return BigInt(hex).toString();
};

export const LOOKUP_LINKS: LookupItem[] = [
  {
    key: "Web3bio",
    getLabel: (r) => `${r.label}.eth profile on Web3.bio`,
    icon: web3bioIcon, // 🚀 3. 绑定图片变量
    shouldShow: (r, cid) =>
      ensUtils.isMainnet(cid) && ensUtils.isRenewable(r.status),
    getLink: (r) => `https://web3.bio/${r.label}.eth`,
  },
  {
    key: "EtherScan",
    getLabel: (r) => `${r.label}.eth records on Etherscan`,
    icon: etherscanIcon,
    shouldShow: (r) => !ensUtils.isAvailable(r.status),
    getLink: (r, cid) => {
      const addr = getContracts(cid);
      const contract = r.wrapped ? addr.ENS_NAME_WRAPPER : addr.ETH_REGISTRAR;
      const baseUrl = ensUtils.isMainnet(cid)
        ? "https://etherscan.io"
        : "https://sepolia.etherscan.io";
      return `${baseUrl}/nft/${contract}/${getTokenId(r)}`;
    },
  },
  {
    key: "Opensea",
    getLabel: (r) => `${r.label}.eth on OpenSea`,
    icon: openseaIcon,
    shouldShow: (r, cid) =>
      ensUtils.isMainnet(cid) && ensUtils.isRenewable(r.status),
    getLink: (r, cid) => {
      const addr = getContracts(cid);
      const contract = r.wrapped ? addr.ENS_NAME_WRAPPER : addr.ETH_REGISTRAR;
      return `https://opensea.io/assets/ethereum/${contract}/${getTokenId(r)}`;
    },
  },
  {
    key: "ENSVision",
    getLabel: (r) => `${r.label}.eth on Vision`,
    icon: envisionIcon,
    shouldShow: (_, cid) => ensUtils.isMainnet(cid),
    getLink: (r) => `https://ensvision.com/name/${r.label}.eth`,
  },
  {
    key: "Grails",
    getLabel: (r) => `${r.label}.eth on Grails`,
    icon: grailsIcon,
    shouldShow: (_, cid) => ensUtils.isMainnet(cid),
    getLink: (r) => `https://grails.app/${r.label}.eth`,
  },
  {
    key: "LinkETH",
    getLabel: (r) => `${r.label}.eth.limo`,
    icon: limoIcon,
    shouldShow: (r) => ensUtils.isActive(r.status),
    getLink: (r) => `https://${r.label}.eth.limo/`,
  },
  {
    key: "DNSRelated",
    getLabel: (r) => `DNS registrations of ${r.label}`,
    icon: dnsIcon,
    shouldShow: () => true,
    getLink: (r) =>
      `https://instantdomainsearch.com/domain/extensions?q=${r.label}`,
  },
];

export const getAvailableLookups = (
  record: NameRecord,
  chainId?: number,
): LookupItem[] => {
  return LOOKUP_LINKS.filter((item) => item.shouldShow(record, chainId));
};
