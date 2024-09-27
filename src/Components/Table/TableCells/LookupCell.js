import React from 'react';
import { BigNumber, utils } from 'ethers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { t } from 'i18next';
import {
  getConfFixed,
  isSepolia,
  isMainnet,
  isNormal,
  isOpen,
  isRenewable,
} from '../../Global/globals';
import { namehash } from 'ethers/lib/utils';

export const LookupCell = (props) => {
  const { conf, label, status, tokenId, owner, wrapped, network } = props;
  const { addr } = getConfFixed().contract;

  const tokenIdOrNamehashDec = wrapped
    ? BigNumber.from(namehash(`${label}.eth`)).toString()
    : BigNumber.from(tokenId).toString();

  const tokenContractAddr = wrapped
    ? addr[network].NameWrapper
    : addr[network].BaseRegImp

  const etherscanURL = isSepolia(network)
    ? 'https://sepolia.etherscan.io/'
    : 'https://etherscan.io/';

  // for td-lookup
  const { lookup } = conf.custom.display;
  // When you modify lookupLinks, you also need to modify:
  // 1. the custom.display.lookup field of conf.json
  // 2. the tb.lookup field of en.json and cn.json
  const lookupLinks = {
    EtherScan: {
      precondition:
        isRenewable(status) || (isMainnet(network) && !isOpen(status)),
      link: isMainnet(network)
        ? `https://etherscan.io/nft/${tokenContractAddr}/${tokenIdOrNamehashDec}`
        : `https://sepolia.etherscan.io/nft/${tokenContractAddr}/${tokenIdOrNamehashDec}`
    },
    CheckTool: {
      precondition: isRenewable(status),
      link: `https://tools.ens.domains/check/${label}.eth`
    },
    Opensea: {
      precondition: isMainnet(network),
      link: wrapped
        ? `https://opensea.io/assets/ethereum/${tokenContractAddr}/${tokenIdOrNamehashDec}`
        : `https://opensea.io/assets/ethereum/${tokenContractAddr}/${tokenIdOrNamehashDec}`
    },
    Vision: {
      precondition: isMainnet(network),
      link: `https://vision.io/name/ens/${label}.eth`
    },
    Godid: {
      precondition: isMainnet(network),
      link: `https://godid.io/items/${label}.eth`
    },
    FollowProtocol: {
      precondition: isMainnet(network) && isRenewable(status),
      link: `https://ethfollow.xyz/${label}.eth`
    },
    Metadata: {
      precondition: isNormal(status),
      link: `https://metadata.ens.domains/${network}/${addr[network].BaseRegImp}/${tokenId}`
    },
    Inventory: {
      precondition:
        isMainnet(network) && isRenewable(status) && utils.isAddress(owner),
      link: `${etherscanURL}token/${tokenContractAddr}?a=${owner}#inventory`
    },
    LinkETH: {
      precondition: isMainnet(network) && isRenewable(status),
      link: `https://${label}.eth.limo/`
    },
    DNSRelated: {
      precondition: true,
      link: `https://instantdomainsearch.com/domain/extensions?q=${label}`
    },
  };

  return Object.keys(lookupLinks).map((item) =>
    lookup[item] && lookupLinks[item].precondition ? ( // decide which should be shown
      <OverlayTrigger
        key={`lookup-key-${item}`}
        placement="top"
        overlay={<Tooltip>{t(`tb.lookup.${item}`, { label: label })}</Tooltip>}
      >
        <a
          href={lookupLinks[item].link}
          className={`me-1 text-center lookup-${item}`}
          target="_blank"
          rel="noreferrer"
        >
          {item.slice(0, 1)}
        </a>
      </OverlayTrigger>
    ) : null
  );
};
