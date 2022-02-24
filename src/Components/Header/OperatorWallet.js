
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function OperatorWallet(props) {
  const { conf, walletInfo, t } = props
  const walletAddr = walletInfo.address
  const walletScanLink = `${conf.fixed.scanConf[conf.custom.network]}address/${walletAddr}`

  return (
    <>
      <OverlayTrigger placement="bottom" overlay={
        <Tooltip>
          {t('header.account') + ": " + walletAddr}
        </Tooltip>
      }>
        <span className="wallet-address">
          <a href={walletScanLink} target="_blank" rel="noreferrer">
            { walletAddr.slice(0, 5) + '...' + walletAddr.slice(-4) }
          </a>
        </span>
      </OverlayTrigger>
      <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('header.balance') + ": " + walletInfo.balance.slice(0, 8) + " ETH"}</Tooltip>}>
        <span className="wallet-balance px-2">Ξ { walletInfo.balance.slice(0, 6) }</span>
      </OverlayTrigger>
    </>
  )
}