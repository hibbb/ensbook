import React from 'react';
import { BigNumber, utils } from 'ethers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { t } from 'i18next';
import { getConfFixed, isMainnet, isNormal, isOpen, isRenewable, isRopsten } from '../../Global/globals';


export const LookupCell = (props) => {
  const { conf, label, status, tokenId, owner, network } = props
  const tokenIdDec = BigNumber.from(tokenId).toString()
  const etherscanURL = (
    isRopsten(network)
    ? "https://ropsten.etherscan.io/"
    : "https://etherscan.io/"
  )
  
  // for td-lookup
  const { addr } = getConfFixed().contract
  const { lookup } = conf.custom.display
  // When you modify lookupLinks, you also need to modify:
  // 1. the custom.display.lookup filed of conf.json
  // 2. the tb.lookup filed of en.json and cn.json
  const lookupLinks = {
    RelatedInfo: {
      precondition: isRenewable(status) || (isMainnet(network) && !isOpen(status)),
      link: (
        isMainnet(network)
        ? `https://etherscan.io/nft/${addr[network].BaseRegImp}/${tokenIdDec}`
        : `https://ropsten.etherscan.io/enslookup-search?search=${label}.eth`
      )
    },
    Opensea: {
      precondition: isMainnet(network) && isRenewable(status),
      link: `https://opensea.io/assets/ethereum/${addr[network].BaseRegImp}/${tokenIdDec}`
    },
    Gem: {
      precondition: isMainnet(network) && isRenewable(status),
      link: `https://www.gem.xyz/asset/${addr[network].BaseRegImp}/${tokenIdDec}`
    },
    Metadata: {
      precondition: isNormal(status),
      link: `https://metadata.ens.domains/${network}/${addr[network].BaseRegImp}/${tokenId}`
    },
    Inventory: {
      precondition: isMainnet(network) && isRenewable(status) && utils.isAddress(owner),
      link: `${etherscanURL}token/${addr[network].BaseRegImp}?a=${owner}#inventory`
    },
    LinkETH: {
      precondition: isMainnet(network) && isRenewable(status),
      link: `https://${label}.eth.limo/`
    },
    DNSRelated: {
      precondition: true,
      link: `https://domains.google.com/registrar/search?tab=1&searchTerm=${label}`
    }
  }

  return (
    Object.keys(lookupLinks).map(item => 
      lookup[item] && lookupLinks[item].precondition  // decide which should be shown
      ? (
        <OverlayTrigger key={'lookup-key-' + item} placement="top" overlay={<Tooltip>{t('tb.lookup.' + item, {label: label})}</Tooltip>}>
          <a href={lookupLinks[item].link} className={'me-1 text-center lookup-' + item} target="_blank" rel="noreferrer">{item.slice(0, 1)}</a>  
        </OverlayTrigger>
      )
      : null
    )
  )
}
