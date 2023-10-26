import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { t } from 'i18next';
import {
  isGoerli,
  isMainnet,
  isNormal,
  isOpen,
  isRenewable,
} from '../../Global/globals';
import { isAddress, namehash } from 'viem';
import { addrs } from '../../Global/addrs';

export const LookupCell = (props) => {
  const { conf, label, status, tokenId, owner, wrapped, chainId } = props;
  const contractAddrs = addrs;

  const tokenIdOrNamehashDec = wrapped
    ? BigInt(namehash(label + '.eth')).toString()
    : BigInt(tokenId).toString();

  const tokenContractAddr = wrapped
    ? contractAddrs[chainId].NameWrapper
    : contractAddrs[chainId].BaseRegImp

  const etherscanURL = isGoerli(chainId)
    ? 'https://goerli.etherscan.io/'
    : 'https://etherscan.io/';

  // for td-lookup
  const { lookup } = conf.custom.display;
  // When you modify lookupLinks, you also need to modify:
  // 1. the custom.display.lookup field of conf.json
  // 2. the tb.lookup field of en.json and cn.json
  const lookupLinks = {
    EtherScan: {
      precondition:
        isRenewable(status) || (isMainnet(chainId) && !isOpen(status)),
      link: isMainnet(chainId)
        ? `https://etherscan.io/nft/${tokenContractAddr}/${tokenIdOrNamehashDec}`
        : `https://goerli.etherscan.io/enslookup-search?search=${label}.eth`
    },
    CheckTool: {
      precondition: isRenewable(status),
      link: `https://tools.ens.domains/check/${label}.eth`
    },
    Opensea: {
      precondition: isMainnet(chainId),
      link: wrapped
        ? `https://opensea.io/assets/ethereum/${tokenContractAddr}/${tokenIdOrNamehashDec}`
        : `https://opensea.io/assets/ethereum/${tokenContractAddr}/${tokenIdOrNamehashDec}`
    },
    Vision: {
      precondition: isMainnet(chainId),
      link: `https://ens.vision/name/${label}`
    },
    Godid: {
      precondition: isMainnet(chainId),
      link: `https://godid.io/items/${label}.eth`
    },
    Metadata: {
      precondition: isNormal(status) && isMainnet(chainId),
      link: `https://metadata.ens.domains/mainnet/${contractAddrs[chainId].BaseRegImp}/${tokenId}`
    },
    Inventory: {
      precondition:
        isMainnet(chainId) && isRenewable(status) && isAddress(owner),
      link: `${etherscanURL}token/${tokenContractAddr}?a=${owner}#inventory`
    },
    LinkETH: {
      precondition: isMainnet(chainId) && isRenewable(status),
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
        key={'lookup-key-' + item}
        placement="top"
        overlay={<Tooltip>{t('tb.lookup.' + item, { label: label })}</Tooltip>}
      >
        <a
          href={lookupLinks[item].link}
          className={'me-1 text-center lookup-' + item}
          target="_blank"
          rel="noreferrer"
        >
          {item.slice(0, 1)}
        </a>
      </OverlayTrigger>
    ) : null
  );
};
