import React from 'react'
import { ethers, utils, Contract } from 'ethers'
import moment from 'moment'
import 'moment/locale/zh-cn'
//import { Modal } from 'react-bootstrap'
import lt from 'long-timeout'
import Web3Modal from "web3modal";
import WalletConnectProvider from '@walletconnect/web3-provider'
import { getConf, isCustomWallet, isSupportedChain, getRegistrableNames } from './Components/Global/globals'
import Header from './Components/Header/Header'
import MainForm from './Components/Form/MainForm'
import MainTable from './Components/Table/MainTable'
import Footer from './Components/Footer/Footer'
import TestBar from './Components/Utils/TestBar'
import MessageToasts from './Components/Utils/MessageToasts'
import UnsupportedNetworkModal from './Components/Utils/UnsupportedNetworkModal'

const conf = getConf()
const defaultProvider = new ethers.providers.InfuraProvider("homestead", conf.custom.infuraID)
// store the newest lookupList to localstorage, keep the list in configform up to date.
const lookupList = Object.keys(conf.custom.display.lookup)
window.localStorage.setItem('lookupList', JSON.stringify(lookupList))

let web3Modal

const INITIAL_STATE = {
  reconnecting: false,
  fetching: false,
  unsupported: false,
  provider: defaultProvider,
  signer: null,
  type: "readonly",
  address: null,
  ensname: null,
  network: "mainnet",
  balance: null
};

class ENSBook extends React.Component {
  t = this.props.t

  constructor(props) {
    super(props)
    const nameInfo = JSON.parse(window.localStorage.getItem("nameInfo")) ?? []
    this.state = { ...INITIAL_STATE, nameInfo }
  }

  reconnectApp = async (updateNamesFlag = true) => {
    this.setState({ reconnecting: true })
    const { provider, signer, type } = await this.getProviderAndSigner()
    this.setState({ provider, signer, type })

    const networkname = (await provider.getNetwork()).name
    if (!isSupportedChain(networkname)) {
      return this.setState({ unsupported: true })
    }

    const network = networkname === "homestead" ? "mainnet" : networkname
    const address = signer ? await signer.getAddress() : null
    const balance = address ? utils.formatEther(await provider.getBalance(address)) : null
    const ensname = address ? await provider.lookupAddress(address) : null
    this.setState({ address, network, balance, ensname })
    this.setState({ reconnecting: false })

    if (updateNamesFlag) {
      await this.updateNames()
    } 
  }

  disconnectApp = async () => {
    const { provider } = this.state
    await web3Modal?.clearCachedProvider()
    // Disconnect wallet connect provider
    if (provider && provider.disconnect) {
      provider.disconnect()
    }
    this.setState({ ...INITIAL_STATE })
    this.updateNames()
  }

  setAndStoreNameInfo = (nameInfo, messageShow = true) => { // update nameInfo in state and store it
    this.setState({ nameInfo })
    window.localStorage.setItem("nameInfo", JSON.stringify(nameInfo))
    if (messageShow) {
      this.MessageToasts.messageShow("setAndStoreNameInfo", this.t('msg.setAndStoreNameInfo'), "msg-default", "true", "5000")  
    }
  }

  getExpiresTimeStamp = async (label) => {
    const conf = getConf()
    const { provider, network } = this.state
    const BaseRegImpCon = new Contract(
      conf.fixed.contract.addr[network].BaseRegImp, 
      conf.fixed.contract.abi.BaseRegImp, 
      provider)
    const tokenId = utils.id(label)
    const expiresTimeBignumber = await BaseRegImpCon.nameExpires(tokenId) // return a BigNumber Object
    return expiresTimeBignumber.toNumber() // unix timestamp
  }

  updateName = async (index, messageShowFlag = true) => {
    const { nameInfo } = this.state
    const expiresTimeStamp = await this.getExpiresTimeStamp(nameInfo[index].label) // unix timestamp
    const nowT = moment()
    const expiresTime = moment.unix(expiresTimeStamp)
    const releaseTime = moment.unix(expiresTimeStamp).add(90, 'days')

    if (expiresTimeStamp < 1) {
      nameInfo[index].status = 'Open'
      nameInfo[index].expiresTime = 0
      nameInfo[index].releaseTime = 0 
    } else {
      nameInfo[index].expiresTime = expiresTime.unix()
      nameInfo[index].releaseTime = releaseTime.unix()
      
      if (nowT <= expiresTime) {
        nameInfo[index].status = 'Normal'
      } else if (nowT <= releaseTime) {
        nameInfo[index].status = 'Grace'
      } else if (nowT <= releaseTime.add(28, 'days')) { // here releaseTime itself add 28 days
        nameInfo[index].status = 'Premium'
      } else if (nowT > releaseTime) {
        nameInfo[index].status = 'Reopen'
      } else {
        nameInfo[index].status = 'Unknown'
      }
    }
    this.setAndStoreNameInfo(nameInfo, messageShowFlag)
    return expiresTimeStamp
  }

  updateNameByLabel = async (label, messageShow = true) => {
    const index = this.state.nameInfo.findIndex(item => item.label === label)
    return this.updateName(index, messageShow)
  }

  updateNames = async (messageShowFlag = true) => {
    this.state.nameInfo.map(async (row, index) => {
      return await this.updateName(index, messageShowFlag)
    })
  }

  register = async (label, duration = null) => {
    const conf = getConf()

    const { provider, signer, nameInfo, address, network } = this.state

    const ETHRegCtrlCon = new Contract(
      conf.fixed.contract.addr[network].ETHRegCtrl, 
      conf.fixed.contract.abi.ETHRegCtrl, 
      signer
    )
    // set the status of the name to 'Regsitering', but no storing
    nameInfo.find(item => item.label === label).status = 'Registering'
    this.setState({ nameInfo })

    let owner = utils.isAddress(conf.custom.receiverAddress) ? conf.custom.receiverAddress : address
    duration = duration ?? moment.duration(conf.custom.regTxConf.duration, 'years').asSeconds()
    duration = Math.max(duration, 2419200)  // 2419200 seconds = 28 days

    const secret = ethers.Wallet.createRandom().privateKey
    window.localStorage.setItem("lastCommit", `{ name: ${label}, owner: ${owner}, secret: ${secret} }`)

    let resolverAddr = "0x0000000000000000000000000000000000000000"
    let resolveToAddr = "0x0000000000000000000000000000000000000000"
    if (conf.custom.regTxConf.registerWithConfig) {
      resolverAddr = conf.fixed.contract.addr[network].PubRes
      resolveToAddr = owner
    }

    let commitOverrides = {} // config overrides 
    let regOverrides = {}

    this.MessageToasts.messageShow(
      "register00", 
      this.t('msg.register00', { 
        label: label, 
        owner: owner.substr(0, 7) + '...', 
        duration: moment.duration(duration, 'seconds').asYears()
      })
    )

    // Step 1.
    if (conf.custom.regTxConf.gasPrice > 0) { // conf.custom.regTxConf.gasPrice: gwei
      commitOverrides.gasPrice = utils.parseUnits(conf.custom.regTxConf.gasPrice.toString(), 'gwei')
    }
    commitOverrides.gasLimit = 70000
    let ourCommitment = await ETHRegCtrlCon.makeCommitmentWithConfig(label, owner, secret, resolverAddr, resolveToAddr)
    let tx10 = await ETHRegCtrlCon.commit(ourCommitment, commitOverrides)
    this.MessageToasts.messageShow(
      "register10", 
      this.t('msg.register10', { label: label })
    )
    let tx11 = await provider.waitForTransaction(tx10.hash, conf.custom.regTxConf.waitConfirms)
    let commitTxLink = '<a href="' + conf.fixed.scanConf[network] + 'tx/' + tx10.hash + '" target="_blank" rel="noreferrer">' + this.t('c.tx') + '</a>'
    // if step 1 failed, cancel the process.
    if (tx11.status) {
      this.MessageToasts.messageShow(
        "register11", 
        this.t('msg.register11.succeed', { label: label, txLink: commitTxLink}),
        "msg-default", "true", "60000"
      )
    } else {
      this.MessageToasts.messageShow(
        "register11", 
        this.t('msg.register11.fail', { label: label, txLink: commitTxLink }),
        "msg-fail", "false"
      )  
      return await this.updateNameByLabel(label) 
    }

    // Step 2.
    // long-timeout is necessary for >24.8 days
    const wait = ms => new Promise(resolve => lt.setTimeout(resolve, ms)) 
    // wait for 2nd pharse of registration
    await wait(conf.fixed.ensConf.minCommitmentAge * 1000)

    this.MessageToasts.messageShow(
      "register20", 
      this.t('msg.register20', { label: label }),
    )

    // Step 3.
    if (conf.custom.regTxConf.gasPrice > 0) { // conf.custom.regTxConf.gasPrice: gwei
      regOverrides.gasPrice = utils.parseUnits(conf.custom.regTxConf.gasPrice.toString(), 'gwei')
    }
    regOverrides.gasLimit = conf.custom.regTxConf.registerWithConfig ? 300000 : 220000
    regOverrides.value = (await ETHRegCtrlCon.rentPrice(label, duration)).mul(105).div(100)

    const tx30 = await ETHRegCtrlCon.registerWithConfig(label, owner, duration, secret, resolverAddr, resolveToAddr, regOverrides)
    const tx31 = await provider.waitForTransaction(tx30.hash, conf.custom.regTxConf.waitConfirms)
    const regTxLink = '<a href="' + conf.fixed.scanConf[network] + 'tx/' + tx30.hash + '" target="_blank" rel="noreferrer">' + this.t('c.tx') + '</a>'

    if (tx31.status) {
      this.MessageToasts.messageShow(
        "register30", 
        this.t('msg.register30.succeed', { label: label, regTxLink: regTxLink }),
        "msg-success", "false"
      )
    } else {
      this.MessageToasts.messageShow(
        "register30", 
        this.t('msg.register30.fail', { label: label, regTxLink: regTxLink }),
        "msg-fail", "false"
      )      
    }
  
    // automaticly update the operator's balance and the name infomation after a registration
    this.setState({ balance: utils.formatEther(await signer.getBalance()) }) 
    return await this.updateNameByLabel(label)
  }

  registerAll = async () => {
    const registrableNames = getRegistrableNames(this.state.nameInfo)
    for (let i = 0; i < registrableNames.length; i++) {
      await this.register(registrableNames[i].label)
    }
  }

  // bookFlags = {}

  // book = (label) => {
  // }

  // cancelBook = (index) => {
  //   this.bookFlags[this.state.nameInfo[index].label] = false
  //   this.updateName(index)
  // }

  renewName = async (label, duration) => {
  }

  estimateCost = async (label, duration = null) => {
    const conf = getConf()
    const { provider, network } = this.state

    duration = duration ?? moment.duration(conf.custom.regTxConf.duration, 'years').asSeconds()
    duration = Math.max(duration, 2419200)  // 2419200 seconds = 28 days
    const contractAddr = conf.fixed.contract.addr[network].ETHRegCtrl
    const contractAbi = conf.fixed.contract.abi.ETHRegCtrl
    const ETHRegCtrlCon = new Contract(contractAddr, contractAbi, provider)
    const rent = await ETHRegCtrlCon.rentPrice(label, duration)

    const gasPrice = (conf.custom.regTxConf.gasPrice > 0 
      ? utils.parseUnits(conf.custom.regTxConf.gasPrice.toString(), 'gwei')
      : await provider.getGasPrice())
    const gasFee = gasPrice.mul(50000 + 270000)  // commitGasLimit + regGasLimit
    const costWei = gasFee.add(rent)

    return costWei
  }

  estimateCosts = async () => {
    const registrableNames = getRegistrableNames(this.state.nameInfo)
    let costWei = ethers.BigNumber.from(0)

    for (let i = 0; i < registrableNames.length; i++) {
      costWei = costWei.add(await this.estimateCost(registrableNames[i].label))
    }
    return costWei
  }

  removeName = (index) => {
    const { nameInfo } = this.state
    Promise.all(nameInfo.filter((nameItem, i) => {return i !== index}))
    .then((nameInfo) => {
      this.setAndStoreNameInfo(nameInfo)
    })
  }
  
  removeNames = () => {
    this.setAndStoreNameInfo([])
  }

  // getProviderAndSigner() return a provider, a signer and a wallet type.
  // wallet type: 'custom' | 'web3' | 'readonly'
  getProviderAndSigner = async () => {
    const conf = getConf()
    let provider
    if (isCustomWallet(conf)) {
      provider = new ethers.providers.InfuraProvider(conf.custom.network, conf.custom.infuraID)
      const signer = new ethers.Wallet(conf.custom.operatorPrivateKey[0], provider)
      return { provider, signer, type: 'custom' }
    } 
    //return await getWeb3Modal(fallback)
    try {
      web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider, // required
            //packageFactory: true,
            options: { infuraId: conf.custom.infuraID }
          }
        }
      })
      provider = await web3Modal.connect()
    } 
    catch(e) {
      console.log(e)
    }

    if (provider) {
      await this.subscribeProvider(provider)
      await provider.enable()
      provider = new ethers.providers.Web3Provider(provider);
      const signer = provider.getSigner();
      return { provider, signer, type: 'web3' }
    }
    else {
      provider = defaultProvider
      return { provider, signer: undefined, type: 'readonly' }
    }
  }

  subscribeProvider = async (provider) => {
    if (!provider.on) {
      return;
    }
    //provider.on("close", () => this.resetApp());
    provider.on("accountsChanged", async (accounts) => {
      this.reconnectApp(false)
    });
    provider.on("chainChanged", async (chainId) => {
      if (isSupportedChain(parseInt(chainId, 16))) {
        this.setState({ unsupported: false })
        this.reconnectApp()
      } else {
        this.setState({ unsupported: true })
      }
    });
  };

  render() {
    const conf = getConf()
    const { reconnecting, unsupported, nameInfo, type, address, ensname, network, balance } = this.state
    const walletInfo = { type, address, ensname, network, balance }
    document.title = conf.custom.pageTag ? `${conf.custom.pageTag}-${conf.projectName}` : conf.projectName

    return (
      <div id="main-wrapper" className="container main-wrapper">
        <Header 
          conf={conf}
          walletInfo={walletInfo}
          reconnectApp={this.reconnectApp}
          disconnectApp={this.disconnectApp}
          reconnecting={reconnecting}
          updateNames={this.updateNames} 
          t={this.t}
        />
        <MainForm 
          nameInfo={nameInfo}
          setAndStoreNameInfo={this.setAndStoreNameInfo}
          updateName={this.updateName}
          t={this.t} 
        />
        <MainTable 
          conf={conf}
          nameInfo={nameInfo} 
          reconnectApp={this.reconnectApp}
          network={network}
          updateName={this.updateName}
          updateNames={this.updateNames} 
          register={this.register} 
          registerAll={this.registerAll}
          removeName={this.removeName} 
          removeNames={this.removeNames}
          estimateCost={this.estimateCost}
          estimateCosts={this.estimateCosts}
          book={this.book}
          cancelBook={this.cancelBook}
          setAndStoreNameInfo={this.setAndStoreNameInfo}
          t={this.t}
        />
        <Footer />
        <TestBar />
        <MessageToasts onRef={(ref)=>{this.MessageToasts=ref}} />
        <UnsupportedNetworkModal unsupported={unsupported} disconnectApp={this.disconnectApp} t={this.t} />
      </div>
    )
  }
}

export default ENSBook;
