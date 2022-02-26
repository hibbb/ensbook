
import React, { useState } from 'react';
import { utils } from 'ethers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Plug, PlugFill } from 'react-bootstrap-icons';
import { createWeb3Modal, clearWeb3Modal, getProviderAndSigner } from '../Global/globals';

const initialState = { 
  type: "readonly",
  address: null, 
  network: null, 
  balance: null, 
  ensname: null 
}

// export async function WalletInfo() { // update walletInfo in state
//   const [ walletInfo, setWalletInfo ] = useState(initialWalletInfo);

//   //let { walletInfo } = this.state
//   const { provider, signer } = await getProviderAndSigner()

//   if (signer) {
//     walletInfo.address = await signer.getAddress()
//     walletInfo.network = (await provider.getNetwork()).name
//     walletInfo.balance = utils.formatEther(await signer.getBalance())
//     walletInfo.ensname = await provider.lookupAddress(walletInfo.address)
//     this.setState({ walletInfo: walletInfo })
//   }
//   return walletInfo
// }

class OperatorWallet extends React.Component {

  constructor() {
    super()
    this.state = initialState
  }

  connect = async () => {
    this.updateWallet()
  }

  disconnect = async () => {
    await clearWeb3Modal()
    this.setState({ type: 'readonly' })
  }

  isConnected = () => {
    return this.state.type === 'web3'
  }

  updateWallet = async () => {
    const { provider, signer, type } = await getProviderAndSigner()
    const walletInfo = this.state
    walletInfo.type = type

    if (type === 'custom' || type === 'web3') {
      walletInfo.address = await signer.getAddress()
      walletInfo.network = (await provider.getNetwork()).name
      walletInfo.balance = utils.formatEther(await signer.getBalance())
      walletInfo.ensname = await provider.lookupAddress(walletInfo.address)
    }
    if (type === 'readonly') {
      walletInfo.network = (await provider.getNetwork()).name
    }
    this.setState(walletInfo)

    return walletInfo
  }

  render() {
    const { conf, setENSBookState, t } = this.props
    const { type, address, network, balance, ensname } = this.state
    const readableAddress = address ? address.slice(0, 5) + '...' + address.slice(-4) : ''
    const walletScanLink = `${conf.fixed.scanConf[network]}address/${address}`
    const walletDisplay = ensname ?? address
  
    
    if (type === 'readonly') { // walletInfo.ensname === null && walletInfo.address === null
      return (
        <button type="button" 
          className="btn btn-primary mx-2 wallet-connect"    
          onClick={()=>this.connect()}
        >
          {t('c.connect')} <PlugFill />
        </button>
      )
    } 
  
    return (
      <>
        <span className={"network px-2 network-" + (network ?? 'unknow')}>
          {t('c.' + (network ?? 'EMPTY'))}
        </span>
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
            {t('header.balance') + ": " + (balance ? balance.slice(0, 8) : '0.0') + " ETH"}
          </Tooltip>
        }>
          <span className="wallet-balance px-2">Ξ { (balance ? balance.slice(0, 6) : '0.0') }</span>
        </OverlayTrigger>
        {
          type === 'web3'
          ? (<OverlayTrigger placement="bottom" overlay={<Tooltip>{t('c.disconnect')}</Tooltip>}>
              <button type="button" 
                className="btn-plain me-2 wallet-disconnect"    
                onClick={()=>this.disconnect()}
              >
                <Plug />
              </button>
            </OverlayTrigger>)
          : null
        }
      </>
    )  
  }
}

export default OperatorWallet