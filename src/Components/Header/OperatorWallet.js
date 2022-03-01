
import React from 'react';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { Plug, WalletFill } from 'react-bootstrap-icons';
import { isCustomWallet } from '../Global/globals';

const CurrentNetwork = (props) => {
  const { network, t } = props
  return (
    <OverlayTrigger placement="bottom" overlay={
      <Tooltip>{t('c.currentNetwork')}</Tooltip>
    }> 
      <span className={"network pe-2 network-" + (network ?? 'mainnet')}>
        {t('c.' + (network ?? 'mainnet'))}
      </span>
    </OverlayTrigger>
  )
}

class OperatorWallet extends React.Component {

  componentDidMount() {
    if (isCustomWallet()) {
      this.props.reconnectApp()
    }
  }

  render() {
    const { walletInfo, reconnectApp, disconnectApp, reconnecting, scanConf, t } = this.props
    const { type, address, ensname, network, balance } = walletInfo
    const readableAddress = address ? address.slice(0, 5) + '...' + address.slice(-4) : null
    const walletScanLink = `${scanConf[network]}address/${address}`  
    
    if (type === 'readonly') {
      return (
      <div className="d-inline-block">
        <CurrentNetwork network={network} t={t} />
        <button type="button" 
          className="btn btn-primary me-2 wallet-connect"    
          onClick={reconnectApp}
        >
          {t('c.connect')}
        </button>
      </div>
      )
    } 

    if (reconnecting) {
      return (
        <Spinner animation="border" variant="secondary" className="me-2 reconnecting" />
      )
    }
  
    return (
      <div className="d-inline-block">
        <CurrentNetwork network={network} t={t} />
        <OverlayTrigger placement="bottom" overlay={
          <Tooltip>
            {t('header.account') + ": " + address}
          </Tooltip>
        }>
          <span className="wallet-address">
            <a href={walletScanLink} target="_blank" rel="noreferrer">
              { ensname ?? readableAddress }
            </a>
          </span>
        </OverlayTrigger>
        <OverlayTrigger placement="bottom" overlay={
          <Tooltip>
            {t('header.balance') + ": " + (balance ?? '').slice(0, 8) + " ETH"}
          </Tooltip>
        }>
          <span className="wallet-balance px-2">Ξ { (balance ?? '').slice(0, 6) }</span>
        </OverlayTrigger>
        {
          type === 'custom'
          ? (
              <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('conf.customMode.icon')}</Tooltip>}>
                <WalletFill className="btn-light me-2 custom-wallet" />
              </OverlayTrigger>
            )
          : (
              <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('c.disconnect')}</Tooltip>}>
                <button type="button" 
                  className="btn-plain me-2 wallet-disconnect"    
                  onClick={disconnectApp}
                >
                  <Plug />
                </button>
              </OverlayTrigger>
            )
        }
      </div>
    )  
  }
}

export default OperatorWallet