import React from 'react'
import { ethers, utils } from 'ethers'
import moment from 'moment'
import 'moment/locale/zh-cn'
import lt from 'long-timeout'
import Web3Modal from "web3modal";
import WalletConnectProvider from '@walletconnect/web3-provider'
import { t } from 'i18next';
import { getConf, isCustomWallet, isSupportedChain, getRegistrableNames, getETHRegCtrlCon, getBaseRegImpCon, storeRegInfo, updateRegStep, getRegInfo } from './Components/Global/globals'
import Header from './Components/Header/Header'
import MainForm from './Components/Form/MainForm'
import MainTable from './Components/Table/MainTable'
import Footer from './Components/Footer/Footer'
import TestBar from './Components/Utils/TestBar'
import MessageToasts from './Components/Utils/MessageToasts'
import UnsupportedNetworkModal from './Components/Utils/UnsupportedNetworkModal'

let conf = getConf()
const defaultProvider = new ethers.providers.InfuraProvider("mainnet", conf.custom.infuraID)
// store the newest lookupList to localstorage, keep the list in configform up to date.
const lookupList = Object.keys(conf.custom.display.lookup)
window.localStorage.setItem('lookupList', JSON.stringify(lookupList))

let web3Modal

const INITIAL_STATE = {
  messages: [{ time: moment(), type: "action", text: "regBefore" }],
  reconnecting: false,
  fetching: false,
  unsupported: false,
  provider: defaultProvider,
  signer: undefined,
  type: "readonly",
  address: undefined,
  ensname: undefined,
  network: "mainnet",
  balance: undefined
};

class ENSBook extends React.Component {

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

  setAndStoreConfInfo = (newConf) => { 
    conf = newConf  // renew the global variable: conf
    window.localStorage.setItem("confInfo", JSON.stringify(conf))
  }

  setAndStoreNameInfo = (nameInfo, messageShowFlag = true) => { // update nameInfo in state and store it
    this.setState({ nameInfo })
    window.localStorage.setItem("nameInfo", JSON.stringify(nameInfo))
    if (messageShowFlag) {
      this.MessageToasts.messageShow("setAndStoreNameInfo", t('msg.setAndStoreNameInfo'))  
    }
  }

  getExpiresTimeStamp = async (label) => {
    const { provider, network } = this.state
    const BaseRegImpCon = getBaseRegImpCon(provider, network, conf)
    const tokenId = utils.id(label)
    const expiresTimeBignumber = await BaseRegImpCon.nameExpires(tokenId) // return a BigNumber Object
    return expiresTimeBignumber.toNumber() // unix timestamp
  }

  updateName = async (index, messageShowFlag = true) => {
    const { nameInfo } = this.state
    const expiresTimeStamp = await this.getExpiresTimeStamp(nameInfo[index].label) // unix timestamp
    const expiresTime = moment.unix(expiresTimeStamp)
    const releaseTime = moment.unix(expiresTimeStamp).add(90, 'days')

    if (expiresTimeStamp < 1) {
      nameInfo[index].status = 'Open'
      nameInfo[index].expiresTime = 0
      nameInfo[index].releaseTime = 0 
    } else {
      nameInfo[index].expiresTime = expiresTime.unix()
      nameInfo[index].releaseTime = releaseTime.unix()
      
      if (moment().isSameOrBefore(expiresTime)) {
        nameInfo[index].status = 'Normal'
      } else if (moment().isSameOrBefore(releaseTime)) {
        nameInfo[index].status = 'Grace'
      } else if (moment().subtract(28, 'days').isSameOrBefore(releaseTime)) { 
        nameInfo[index].status = 'Premium'
      } else if (moment().subtract(28, 'days').isAfter(releaseTime)) {
        nameInfo[index].status = 'Reopen'
      } else {
        nameInfo[index].status = 'Unknown'
      }
    }

    if (nameInfo[index].regStep > 0) {
      nameInfo[index].regStep = await updateRegStep(nameInfo[index].label, nameInfo[index].regStep, this.state.provider)
    }

    this.setAndStoreNameInfo(nameInfo, messageShowFlag)
    return expiresTimeStamp
  }

  updateNameByLabel = async (label) => {
    const index = this.state.nameInfo.findIndex(item => item.label === label)
    return this.updateName(index)
  }

  updateBalance = async () => {
    this.setState({ balance: utils.formatEther(await this.state.signer.getBalance()) }) 
  }

  updateNames = async (messageShowFlag = true) => {
    this.state.nameInfo.map(async (row, index) => {
      return await this.updateName(index, messageShowFlag)
    })
  }

  registerName = async (label, duration, regFrom = 0) => {

    const { provider, signer, address, network, nameInfo } = this.state
    const index = nameInfo.findIndex(item => item.label === label)

    let messages = [{ 
        time: moment(), 
        type: "action", 
        text: "regStarted" 
    }]
    this.setState({ messages })

    const ETHRegCtrlCon = getETHRegCtrlCon(signer, network, conf)

    duration = duration ?? moment.duration(conf.custom.register.duration, 'years').asSeconds()
    duration = Math.max(duration, 2419200)  // 2419200 seconds = 28 days

    let regInfo = {
      owner: undefined,
      duration: duration,
      secret: undefined,
      resolver: "0x0000000000000000000000000000000000000000",
      addr: "0x0000000000000000000000000000000000000000",
      commitment: undefined
    }    

    // prepare of regNew or regFrom*

    const regPrepare = async (regFrom) => {
      if (regFrom <= 0) {
        regInfo.owner = utils.isAddress(conf.custom.register.receiver) ? conf.custom.register.receiver : address

        regInfo.secret = ethers.Wallet.createRandom().privateKey
        window.localStorage.setItem("lastCommit", `{ name: ${label}, owner: ${regInfo.owner}, secret: ${regInfo.secret} }`)

        if (conf.custom.register.registerWithConfig) {
          regInfo.resolver = conf.fixed.contract.addr[network].PubRes
          regInfo.addr = regInfo.owner
        }

        messages.push({ time: moment(), type: "info", text: t('msg.register00', { 
          label: label, 
          owner: regInfo.owner.substr(0, 7) + '...', 
          duration: moment.duration(duration, 'seconds').asYears().toFixed(2)
          }) })
        this.setState({ messages })

        // makeCommitmentWithConfig
        regInfo.commitment = await ETHRegCtrlCon.makeCommitmentWithConfig(
          label, 
          regInfo.owner, 
          regInfo.secret, 
          regInfo.resolver, 
          regInfo.addr
        )

        // init regInfo
        storeRegInfo(label, regInfo)
        return regFrom
      }
      else {
        regInfo = { ...getRegInfo(label), duration: duration }  // support inputing a new duration
        storeRegInfo(label, regInfo)

        messages.push({ time: moment(), type: "info", text: t('msg.register00', { 
          label: label, 
          owner: regInfo.owner.substr(0, 7) + '...', 
          duration: moment.duration(regInfo.duration, 'seconds').asYears().toFixed(2)
          }) })
        this.setState({ messages })

        return await updateRegStep(label, regFrom, provider)
      }
    }   

    // *** regStep 0 -> 0.5

    const regFrom0 = async () => {    
      let commitOverrides = {} // config overrides 
      if (conf.custom.wallet.gasPrice > 0) { // conf.custom.wallet.gasPrice: gwei
        commitOverrides.gasPrice = utils.parseUnits(conf.custom.wallet.gasPrice.toString(), 'gwei')
      }
      commitOverrides.gasLimit = 70000

      try { // submit the 1st transaction
        const commitTx = await ETHRegCtrlCon.commit(regInfo.commitment, commitOverrides)
        regInfo.commitTxHash = commitTx.hash
      } catch(e) {
        console.log(e)
        messages[0] = { 
          time: moment(), 
          type: "action", 
          text: "regSuspended" 
        }
        return this.setState({ messages })
      }

      //regInfo = { ...regInfo, commitTxHash: tx10.hash }
      storeRegInfo(label, regInfo)

      nameInfo[index].regStep = 0.5
      this.setAndStoreNameInfo(nameInfo, false)
      
      // Steps Left
      await regFrom05()
    }

    // *** regStep 0.5 -> 1 / 0

    const regFrom05 = async () => {
      messages.push({ 
        time: moment(), 
        type: "info", 
        text: t('msg.register10', { label: label }) 
      })
      this.setState({ messages })

      const tx11 = await provider.waitForTransaction(regInfo.commitTxHash, 2) // waitConfirms: 2
      const commitTxLink = '<a href="' + conf.fixed.scanConf[network] + 'tx/' + regInfo.commitTxHash + '" target="_blank" rel="noreferrer">' + t('c.tx') + '</a>'
      
      if (tx11.status) {
        nameInfo[index].regStep = 1
        this.setAndStoreNameInfo(nameInfo, false)

        messages.push({ 
          time: moment(), 
          type: "info", 
          text: t('msg.register11.succeed', { label: label, txLink: commitTxLink }) 
        })
        this.setState({ messages })
      } 
      else { // if step 1 failed, cancel the process.
        nameInfo[index].regStep = 0
        this.setAndStoreNameInfo(nameInfo, false)

        messages[0] = { 
          time: moment(), 
          type: "action", 
          text: "regFailed" 
        }
        messages.push({ 
          time: moment(), 
          type: "fail", 
          text: t('msg.register11.fail', { label: label, txLink: commitTxLink }) 
        })
        this.setState({ messages })
        return
      }

      // Steps Left
      await regFrom1()
    }

    // *** regStep 1 -> 2

    const regFrom1 = async () => {
      // long-timeout is necessary for >24.8 days
      const wait = ms => new Promise(resolve => lt.setTimeout(resolve, ms)) 
      await wait(conf.fixed.ensConf.minCommitmentAge * 1000)
      
      nameInfo[index].regStep = 2
      this.setAndStoreNameInfo(nameInfo, false)

      // Steps Left
      await regFrom2()
    }

    // *** regStep 2 -> 2.5

    const regFrom2 = async () => {
      messages.push({ 
        time: moment(), 
        type: "info", 
        text: t('msg.register20', { label: label }) 
      })
      this.setState({ messages })

      let regOverrides = {}
      if (conf.custom.wallet.gasPrice > 0) { // conf.custom.wallet.gasPrice: gwei
        regOverrides.gasPrice = utils.parseUnits(String(conf.custom.wallet.gasPrice), 'gwei')
      }
      regOverrides.gasLimit = conf.custom.register.registerWithConfig ? 300000 : 220000
      regOverrides.value = (await ETHRegCtrlCon.rentPrice(label, duration)).mul(105).div(100)

      try { // submit the 2nd transaction
        const regTx = await ETHRegCtrlCon.registerWithConfig(
          label, 
          regInfo.owner, 
          regInfo.duration, 
          regInfo.secret, 
          regInfo.resolver, 
          regInfo.addr, 
          regOverrides
        )
        regInfo.regTxHash = regTx.hash
      } catch(e) {
        console.log(e)
        messages[0] = { 
          time: moment(), 
          type: "action", 
          text: "regSuspended" 
        }
        return this.setState({ messages })
      }
      //const tx30 = await ETHRegCtrlCon.registerWithConfig(label, regInfo.owner, regInfo.duration, regInfo.secret, regInfo.resolver, regInfo.addr, regOverrides)

      //regInfo = { ...regInfo, regTxHash: tx30.hash }
      storeRegInfo(label, regInfo)
      nameInfo[index].regStep = 2.5
      this.setAndStoreNameInfo(nameInfo, false)

      // Steps Left
      await regFrom25()
    }

    // *** regStep 2.5 -> 3 / 2

    const regFrom25 = async () => {
      messages.push({ 
        time: moment(), 
        type: "info", 
        text: t('msg.register30', { label: label }) 
      })
      this.setState({ messages })

      const tx31 = await provider.waitForTransaction(regInfo.regTxHash, 1) // waitConfirms: 2
      const regTxLink = '<a href="' + conf.fixed.scanConf[network] + 'tx/' + regInfo.regTxHash + '" target="_blank" rel="noreferrer">' + t('c.tx') + '</a>'
      // insert regInfo: regTx
      if (tx31.status) {
        nameInfo[index].regStep = 3
        this.setAndStoreNameInfo(nameInfo, false)

        messages[0] = { 
          time: moment(), 
          type: "action", 
          text: "regSucceeded" 
        }
        messages.push({ 
          time: moment(), 
          type: "info", 
          text: t('msg.register31.succeed', { label: label, regTxLink: regTxLink }) 
        })
      } else {
        nameInfo[index].regStep = 2
        this.setAndStoreNameInfo(nameInfo, false)

        messages[0] = { 
          time: moment(), 
          type: "action", 
          text: "regFailed" 
        }
        messages.push({ 
          time: moment(),
          type: "info", 
          text: t('msg.register31.fail', { label: label, regTxLink: regTxLink }) 
        })
      }
      this.setState({ messages })
      // messages = [] will be executed in registerNameEnd()
    }

    const updatedRegFrom = await regPrepare(regFrom)

    if (updatedRegFrom === 2.5) return await regFrom25()
    if (updatedRegFrom === 2) return await regFrom2()
    if (updatedRegFrom === 1) return await regFrom1()
    if (updatedRegFrom === 0.5) return await regFrom05()
    return await regFrom0()
  }

  registerNameEnd = (label) => {
    this.setState({ messages: INITIAL_STATE.messages })
    this.updateNameByLabel(label)
    this.updateBalance()
  }


  registerNames = async () => {
    const registrableNames = getRegistrableNames(this.state.nameInfo)
    for (let i = 0; i < registrableNames.length; i++) {
      await this.registerName(registrableNames[i].label)
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

  estimateCost = async (label, duration) => {
    const { provider, network } = this.state

    duration = duration ?? moment.duration(conf.custom.register.duration, 'years').asSeconds()
    duration = Math.max(duration, 2419200)  // 2419200 seconds = 28 days
    const ETHRegCtrlCon = getETHRegCtrlCon(provider, network)
    const rent = await ETHRegCtrlCon.rentPrice(label, duration)

    const gasPrice = (conf.custom.register.gasPrice > 0 
      ? utils.parseUnits(conf.custom.register.gasPrice.toString(), 'gwei')
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
    let provider
    if (isCustomWallet(conf)) {
      provider = new ethers.providers.InfuraProvider(conf.custom.wallet.network, conf.custom.infuraID)
      const signer = new ethers.Wallet(conf.custom.wallet.operatorPrivateKey[0], provider)
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
    const { 
      messages, 
      reconnecting, 
      unsupported, 
      nameInfo, 
      type, 
      address, ensname, network, balance 
    } = this.state

    const walletInfo = { type, address, ensname, network, balance }
    document.title = conf.custom.pageTag ? `${conf.custom.pageTag} - ${conf.projectName}` : conf.projectName

    return (
      <div id="main-wrapper" className="container main-wrapper">
        <Header 
          conf={conf}
          walletInfo={walletInfo}
          reconnectApp={this.reconnectApp}
          disconnectApp={this.disconnectApp}
          reconnecting={reconnecting}
          setAndStoreConfInfo={this.setAndStoreConfInfo}
        />
        <MainForm 
          nameInfo={nameInfo}
          setAndStoreNameInfo={this.setAndStoreNameInfo}
          updateName={this.updateName}
        />
        <MainTable 
          conf={conf}
          nameInfo={nameInfo} 
          reconnectApp={this.reconnectApp}
          type={type}
          network={network}
          updateName={this.updateName}
          updateNames={this.updateNames} 
          registerName={this.registerName} 
          registerNames={this.registerNames}
          registerNameEnd={this.registerNameEnd}
          removeName={this.removeName} 
          removeNames={this.removeNames}
          estimateCost={this.estimateCost}
          estimateCosts={this.estimateCosts}
          messages={messages}
          // book={this.book}
          // cancelBook={this.cancelBook}
          setAndStoreNameInfo={this.setAndStoreNameInfo}
        />
        <Footer />
        <TestBar />
        <MessageToasts onRef={(ref)=>{this.MessageToasts=ref}} />
        <UnsupportedNetworkModal show={unsupported} disconnectApp={this.disconnectApp} />
      </div>
    )
  }
}

export default ENSBook;
