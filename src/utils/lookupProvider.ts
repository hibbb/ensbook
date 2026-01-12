// src/utils/lookupProvider.ts

import type { NameRecord } from "../types/ensNames";
import { MAINNET_CONTRACTS } from "../config/contracts";
import * as ensUtils from "./ens";
import type { TFunction } from "i18next";

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
  // 🚀 2. 修改签名：接收 t 函数
  getLabel: (record: NameRecord, t: TFunction) => string;
  icon: string;
  getLink: (record: NameRecord) => string;
  shouldShow: (record: NameRecord) => boolean;
}

const getTokenId = (record: NameRecord): string => {
  const hex = record.wrapped ? record.namehash : record.labelhash;
  return BigInt(hex).toString();
};

export const LOOKUP_LINKS: LookupItem[] = [
  {
    key: "Web3bio",
    // 🚀 3. 使用 t 函数翻译
    getLabel: (r, t) => t("lookup.web3bio", { label: r.label }),
    icon: web3bioIcon,
    shouldShow: (r) => ensUtils.isRenewable(r.status),
    getLink: (r) => `https://web3.bio/${r.label}.eth`,
  },
  {
    key: "EtherScan",
    getLabel: (r, t) => t("lookup.etherscan", { label: r.label }),
    icon: etherscanIcon,
    shouldShow: (r) => !ensUtils.isAvailable(r.status),
    getLink: (r) => {
      const contract = r.wrapped
        ? MAINNET_CONTRACTS.ENS_NAME_WRAPPER
        : MAINNET_CONTRACTS.ETH_REGISTRAR;
      const baseUrl = "https://etherscan.io";
      return `${baseUrl}/nft/${contract}/${getTokenId(r)}`;
    },
  },
  {
    key: "Opensea",
    getLabel: (r, t) => t("lookup.opensea", { label: r.label }),
    icon: openseaIcon,
    shouldShow: (r) => !ensUtils.isAvailable(r.status),
    getLink: (r) => {
      const contract = r.wrapped
        ? MAINNET_CONTRACTS.ENS_NAME_WRAPPER
        : MAINNET_CONTRACTS.ETH_REGISTRAR;
      return `https://opensea.io/assets/ethereum/${contract}/${getTokenId(r)}`;
    },
  },
  {
    key: "ENSVision",
    getLabel: (r, t) => t("lookup.vision", { label: r.label }),
    icon: envisionIcon,
    shouldShow: (r) => !ensUtils.isAvailable(r.status),
    getLink: (r) => `https://ensvision.com/name/${r.label}.eth`,
  },
  {
    key: "Grails",
    getLabel: (r, t) => t("lookup.grails", { label: r.label }),
    icon: grailsIcon,
    shouldShow: (r) => !ensUtils.isAvailable(r.status),
    getLink: (r) => `https://grails.app/${r.label}.eth`,
  },
  {
    key: "LinkETH",
    getLabel: (r, t) => t("lookup.limo", { label: r.label }),
    icon: limoIcon,
    shouldShow: (r) => ensUtils.isActive(r.status),
    getLink: (r) => `https://${r.label}.eth.limo/`,
  },
  {
    key: "DNSRelated",
    getLabel: (r, t) => t("lookup.dns", { label: r.label }),
    icon: dnsIcon,
    shouldShow: () => true,
    getLink: (r) =>
      `https://instantdomainsearch.com/domain/extensions?q=${r.label}`,
  },
];

export const getAvailableLookups = (record: NameRecord): LookupItem[] => {
  return LOOKUP_LINKS.filter((item) => item.shouldShow(record));
};
