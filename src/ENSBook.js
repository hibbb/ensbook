import React from 'react'
import { ethers, utils } from 'ethers'
import moment from 'moment'
import 'moment/locale/zh-cn'
import lt from 'long-timeout'
import Web3Modal from "web3modal";
import WalletConnectProvider from '@walletconnect/web3-provider'
import { t } from 'i18next';
import { isCustomWallet, isSupportedChain, getETHRegCtrlCon, getBaseRegImpCon, storeRegInfo, updateRegStep, getRegInfo, updateLookupList, isRegistrable, getNameItemByLabel, getBulkRenewCon, getConfFixed, queryNameInfo, getETHPriceFeedCon } from './Components/Global/globals'
import Header from './Components/Header/Header'
import MainForm from './Components/Form/MainForm'
import MainTable from './Components/Table/MainTable'
import Footer from './Components/Footer/Footer'
import TestBar from './Components/Utils/TestBar'
import MessageToasts from './Components/Utils/MessageToasts'
import UnsupportedNetworkModal from './Components/Utils/UnsupportedNetworkModal'

let web3Modal
let conf = updateLookupList() // getConf() inside
const confFixed = getConfFixed()
const defaultProvider = new ethers.providers.InfuraProvider("mainnet", conf.custom.infuraID)

const INITIAL_STATE = {
  regMsges: [{ time: moment(), type: "action", text: "regBefore" }], // for registerName process
  regsMsges: [{ time: moment(), type: "action", text: "regsBefore" }], // for registerNames process
  renewMsges: [{ time: moment(), type: "action", text: "renewBefore" }], // for renewName process
  renewsMsges: [{ time: moment(), type: "action", text: "renewsBefore" }], // for renewNames process
  reconnecting: false,
  fetching: false,
  unsupported: false,
  provider: defaultProvider,
  signer: undefined,
  type: "readonly",
  address: undefined,
  ensname: undefined,
  network: "mainnet",
  balance: undefined,
  ethPrice: undefined
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
      console.log(networkname)
      return this.setState({ unsupported: true })
    }

    const network = networkname === "homestead" ? "mainnet" : networkname
    const address = signer ? await signer.getAddress() : null
    const balance = address ? utils.formatEther(await provider.getBalance(address)) : null
    const ensname = address ? await provider.lookupAddress(address) : null
    const ethPrice = conf.custom.premium.priceUnit === 'ETH' ? await this.getETHPrice() : undefined
    this.setState({ address, network, balance, ensname, ethPrice })
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

  getDefaultNameReceiver = () => {
    const defaultReceiver = conf.custom.register.receiver 
      ? conf.custom.register.receiver 
      : (this.state.ensname ?? this.state.address)
    return defaultReceiver
  }

  updateNames = async (labels, messageShowFlag = true) => {
    let { nameInfo, provider, network } = this.state
    labels = labels ?? nameInfo.map(item => item.label)
    const labelsGroupsCount = Math.ceil(labels.length/100)

    this.setState({ fetching: true })

    for (let n = 0; n < labelsGroupsCount; n++) {
      const labelsGroup = labels.slice(n * 100, n * 100 + 100)
      nameInfo = await queryNameInfo(labelsGroup, nameInfo, provider, network)
      this.setAndStoreNameInfo(nameInfo, messageShowFlag)
    }
    this.setState({ fetching: false })
  }

  updateBalance = async () => {
    this.setState({ balance: utils.formatEther(await this.state.signer.getBalance()) }) 
  }

  isRegistrableNow = async (label, nameInfo) => {
    await this.updateNames([label], false)
    return isRegistrable(getNameItemByLabel(label, nameInfo).status)
  }

  // registerName actions: regBefore, regStarted, regSupended, regSucceeded, regFailed

  registerName = async (label, duration, receiver, regFrom = 0, regTo = 3) => {
    if (regFrom >= regTo) {
      return console.log("Warning: regFrom must < regTo.")
    }

    const { provider, signer, network, nameInfo } = this.state
    const index = nameInfo.findIndex(item => item.label === label)

    let regMsges = [{ 
      time: moment(), 
      type: "action", 
      text: "regStarted" 
    }]
    this.setState({ regMsges })

    const ETHRegCtrlCon = getETHRegCtrlCon(signer, network, conf)

    duration = duration ?? moment.duration(conf.custom.register.duration, 'years').asSeconds()
    duration = Math.max(duration, 2419200)  // 2419200 seconds = 28 days

    let regInfo = {
      receiver: undefined,  // receiver can be address or ENS name
      owner: undefined,     // owner can only be a standard ETH address
      duration: duration,
      secret: undefined,
      resolver: "0x0000000000000000000000000000000000000000",
      addr: "0x0000000000000000000000000000000000000000",
      commitment: undefined
    }    

    // prepare of regNew or regFrom*

    const regPrepare = async (regFrom) => {
      if (regFrom <= 0) {
        // Verify that the user entered a valid receiver (ETH address or ENS name)
        try { 
          const owner = await provider.resolveName(receiver)
          if (!owner) { throw new Error('This ENS does not have an address configured.') }

          regInfo.receiver = receiver
          regInfo.owner = owner
        } catch(e) {
          console.log(e)
          regMsges[0] = { 
            time: moment(), 
            type: "action", 
            text: "regBefore" 
          }
          regMsges.push({ 
            time: moment(), 
            type: "failed", 
            text: t('modal.reg.wrongReceiver') 
          })
          this.setState({ regMsges })
          return 0
        }

        regInfo.secret = ethers.Wallet.createRandom().privateKey

        if (conf.custom.register.registerWithConfig) {
          regInfo.resolver = confFixed.contract.addr[network].PubRes
          regInfo.addr = regInfo.owner
        }

        regMsges.push({ time: moment(), type: "info", text: t('modal.reg.register00', { 
          label: label, 
          owner: regInfo.owner.substr(0, 7) + '...', 
          duration: moment.duration(duration, 'seconds').asYears().toFixed(2)
          }) })
        this.setState({ regMsges })

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

        regMsges.push({ time: moment(), type: "info", text: t('modal.reg.register00', { 
          label: label, 
          owner: regInfo.owner.substr(0, 7) + '...', 
          duration: moment.duration(regInfo.duration, 'seconds').asYears().toFixed(2)
          }) 
        })
        this.setState({ regMsges })

        return await updateRegStep(label, regFrom, provider)
      }
    }   

    // *** regStep 0 -> 0.5

    const regFrom0 = async () => {
      // double check if each name is registrable now
      if (!this.isRegistrableNow(label, nameInfo)) {
        nameInfo[index].regStep = 0
        this.setAndStoreNameInfo(nameInfo, false)

        regMsges.push({ 
          time: moment(),
          type: "info", 
          text: t('modal.reg.unregistrableNow', { label: label }) 
        })
        regMsges[0] = { 
          time: moment(), 
          type: "action", 
          text: "regFailed" 
        }
        this.setState({ regMsges })
        return nameInfo[index].regStep        
      }

            
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
        nameInfo[index].regStep = 0
        this.setState({ nameInfo })
        regMsges[0] = { 
          time: moment(), 
          type: "action", 
          text: "regSuspended" 
        }
        this.setState({ regMsges })
        return nameInfo[index].regStep
      }

      //regInfo = { ...regInfo, commitTxHash: tx10.hash }
      storeRegInfo(label, regInfo)

      nameInfo[index].regStep = 0.5
      this.setAndStoreNameInfo(nameInfo, false)
      
      if (regTo <= 0.5) { return nameInfo[index].regStep } 
      return await regFrom05()
    }

    // *** regStep 0.5 -> 1 / 0

    const regFrom05 = async () => {
      const commitTxLink = '<a href="' + confFixed.scanConf[network] + 'tx/' + regInfo.commitTxHash + '" target="_blank" rel="noreferrer">' + t('c.tx') + '</a>'

      regMsges.push({ 
        time: moment(), 
        type: "info", 
        text: t('modal.reg.register10', { label: label, txLink: commitTxLink }) 
      })
      this.setState({ regMsges })

      const commitTxReceipt = await provider.waitForTransaction(regInfo.commitTxHash, 3) // waitConfirms: 3

      if (commitTxReceipt.status) {
        nameInfo[index].regStep = 1
        this.setAndStoreNameInfo(nameInfo, false)

        regMsges.push({ 
          time: moment(), 
          type: "info", 
          text: t('modal.reg.register11.succeed', { label: label, txLink: commitTxLink }) 
        })
        this.setState({ regMsges })
      } 
      else { // if step 1 failed, cancel the process.
        nameInfo[index].regStep = 0
        this.setAndStoreNameInfo(nameInfo, false)

        regMsges[0] = { 
          time: moment(), 
          type: "action", 
          text: "regFailed" 
        }
        regMsges.push({ 
          time: moment(), 
          type: "failed", 
          text: t('modal.reg.register11.fail', { label: label, txLink: commitTxLink }) 
        })
        this.setState({ regMsges })
        return nameInfo[index].regStep
      }

      if (regTo <= 1) { return nameInfo[index].regStep } 
      return await regFrom1()
    }

    // *** regStep 1 -> 2

    const regFrom1 = async () => {
      // long-timeout is necessary for durations >24.8 days
      const wait = ms => new Promise(resolve => lt.setTimeout(resolve, ms)) 
      await wait(confFixed.ensConf.minCommitmentAge * 1000)
      
      nameInfo[index].regStep = 2
      this.setAndStoreNameInfo(nameInfo, false)

      if (regTo <= 2) { return nameInfo[index].regStep } 
      return await regFrom2()
    }

    // *** regStep 2 -> 2.5

    const regFrom2 = async () => {
      regMsges.push({ 
        time: moment(), 
        type: "info", 
        text: t('modal.reg.register20', { label: label }) 
      })
      this.setState({ regMsges })

      // double check if each name is registrable now
      if (!this.isRegistrableNow(label, nameInfo)) {
        nameInfo[index].regStep = 0
        this.setAndStoreNameInfo(nameInfo, false)

        regMsges.push({ 
          time: moment(),
          type: "info", 
          text: t('modal.reg.unregistrableNow', { label: label }) 
        })
        regMsges[0] = { 
          time: moment(), 
          type: "action", 
          text: "regFailed" 
        }
        this.setState({ regMsges })
        return nameInfo[index].regStep        
      }

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
        nameInfo[index].regStep = 2
        this.setState({ nameInfo })
        regMsges[0] = { 
          time: moment(), 
          type: "action", 
          text: "regSuspended" 
        }
        this.setState({ regMsges })
        return nameInfo[index].regStep
      }

      //regInfo = { ...regInfo, regTxHash: tx30.hash }
      storeRegInfo(label, regInfo)
      nameInfo[index].regStep = 2.5
      this.setAndStoreNameInfo(nameInfo, false)

      if (regTo <= 2.5) { return nameInfo[index].regStep } 
      return await regFrom25()
    }

    // *** regStep 2.5 -> 3 / 2

    const regFrom25 = async () => {
      const regTxLink = '<a href="' + confFixed.scanConf[network] + 'tx/' + regInfo.regTxHash + '" target="_blank" rel="noreferrer">' + t('c.tx') + '</a>'

      regMsges.push({ 
        time: moment(), 
        type: "info", 
        text: t('modal.reg.register30', { label: label, regTxLink: regTxLink }) 
      })
      this.setState({ regMsges })

      const regTxReceipt = await provider.waitForTransaction(regInfo.regTxHash, 2) // waitConfirms: 2
      // insert regInfo: regTx
      if (regTxReceipt.status) {
        nameInfo[index].regStep = 3
        this.setAndStoreNameInfo(nameInfo, false)

        regMsges.push({ 
          time: moment(), 
          type: "info", 
          text: t('modal.reg.register31.succeed', { label: label, regTxLink: regTxLink }) 
        })
        regMsges[0] = { 
          time: moment(), 
          type: "action", 
          text: "regSucceeded" 
        }
        this.setState({ regMsges })
        return nameInfo[index].regStep
      } 
      else {
        nameInfo[index].regStep = 2
        this.setAndStoreNameInfo(nameInfo, false)

        regMsges.push({ 
          time: moment(),
          type: "info", 
          text: t('modal.reg.register31.fail', { label: label, regTxLink: regTxLink }) 
        })
        regMsges[0] = { 
          time: moment(), 
          type: "action", 
          text: "regFailed" 
        }
        this.setState({ regMsges })
        return nameInfo[index].regStep
      }
      // regMsges = INITIAL_STATE.regMsges will be executed in registerNameEnd()
    }

    const updatedRegFrom = await regPrepare(regFrom)

    if (updatedRegFrom < 0) return 0  // execute this line if prepare failed
    if (updatedRegFrom === 2.5) return await regFrom25()
    if (updatedRegFrom === 2) return await regFrom2()
    if (updatedRegFrom === 1) return await regFrom1()
    if (updatedRegFrom === 0.5) return await regFrom05()
    return await regFrom0()
  }

  registerNameEnd = async (label) => {
    this.setState({ regMsges: INITIAL_STATE.regMsges })
    await this.updateNames([label])
    await this.updateBalance()
  }

  // registerNames actions: regsBefore, regsStarted, regsEnded

  registerNames = async (regList, duration, receiver) => {
    let regsMsges = [{ 
      time: moment(), 
      type: "action", 
      text: "regsStarted" 
    }]
    this.setState({ regsMsges })

    for (let i = 0; i < regList.length; i++) {
      const regResult = await this.registerName(regList[i], duration, receiver)
      
      if (regResult === 3) {
        regsMsges.push({
          time: moment(),
          type: "succeeded",
          text: regList[i] + '.eth'
        })
        this.setState({ regsMsges })
      } else {
        regsMsges.push({
          time: moment(),
          type: "failed",
          text: regList[i] + '.eth'
        })
        this.setState({ regsMsges })
      }
    }

    regsMsges.push({
      time: moment(),
      type: "ended",
      text: t('modal.regs.regsEnded')
    })
    regsMsges[0] = { 
      time: moment(), 
      type: "action", 
      text: "regsEnded" 
    }
    this.setState({ regsMsges })
    this.setState({ regMsges: INITIAL_STATE.regMsges })
  }

  registerNamesEnd = async (regList) => {
    this.setState({ regsMsges: INITIAL_STATE.regsMsges })
    await this.updateNames(regList)
    await this.updateBalance()
  }

  renewName = async (label, duration) => {
    const { provider, signer, network } = this.state

    duration = duration ?? moment.duration(conf.custom.renew.duration, 'years').asSeconds()
    const ETHRegCtrlCon = getETHRegCtrlCon(signer, network, conf)

    let renewMsges = [{ 
      time: moment(), 
      type: "action", 
      text: "renewStarted" 
    }]
    renewMsges.push({ 
      time: moment(), 
      type: "info", 
      text: t('modal.renew.renew00', { 
        label: label, 
        duration: moment.duration(duration, 'seconds').asYears().toFixed(2)
      }) 
    })
    this.setState({ renewMsges })

    let renewTx
    let renewTxLink
    let renewOverrides = {}
    if (conf.custom.wallet.gasPrice > 0) { // conf.custom.wallet.gasPrice: gwei
      renewOverrides.gasPrice = utils.parseUnits(String(conf.custom.wallet.gasPrice), 'gwei')
    }
    renewOverrides.gasLimit = 120000   // !!!!!
    renewOverrides.value = (await ETHRegCtrlCon.rentPrice(label, duration)).mul(105).div(100)

    try { // submit the 2nd transaction
      renewTx = await ETHRegCtrlCon.renew(label, duration, renewOverrides)
      renewTxLink = '<a href="' + confFixed.scanConf[network] + 'tx/' + renewTx.hash + '" target="_blank" rel="noreferrer">' + t('c.tx') + '</a>'

      renewMsges.push({
        time: moment(), 
        type: "info", 
        text: t('modal.renew.renew10', { label: label, txLink: renewTxLink })
      }) 
      this.setState({ renewMsges })
    } catch(e) {
      console.log(e)
      renewMsges[0] = {
        time: moment(), 
        type: "action", 
        text: "renewSuspended" 
      }
      this.setState({ renewMsges })
      return
    }
    
    const renewTxReceipt = await provider.waitForTransaction(renewTx.hash, 1)

    if (renewTxReceipt.status) {
      renewMsges.push({
        time: moment(), 
        type: "info", 
        text: t('modal.renew.renew11.succeed', { label: label, txLink: renewTxLink })
      }) 
      renewMsges[0] = { 
        time: moment(), 
        type: "action", 
        text: "renewSucceeded" 
      }
      this.setState({ renewMsges })
    } else {
      renewMsges.push({
        time: moment(), 
        type: "info", 
        text: t('modal.renew.renew11.fail', { label: label, txLink: renewTxLink })  
      }) 
      renewMsges[0] = { 
        time: moment(), 
        type: "action", 
        text: "renewFailed" 
      }
      this.setState({ renewMsges })
    }
  }

  renewNameEnd = async (label) => {
    this.setState({ renewMsges: INITIAL_STATE.renewMsges })
    await this.updateNames([label])
    await this.updateBalance()
  }

  renewNames = async (renewList, duration) => {
    const { provider, signer, network } = this.state

    duration = duration ?? moment.duration(conf.custom.renew.duration, 'years').asSeconds()
    const BulkRenewCon = getBulkRenewCon(signer, network, conf)

    let renewsMsges = [{ 
      time: moment(), 
      type: "action", 
      text: "renewsStarted" 
    }]
    renewsMsges.push({ 
      time: moment(), 
      type: "info", 
      text: t('modal.renews.renews00', { 
        duration: moment.duration(duration, 'seconds').asYears().toFixed(2)
      }) 
    })
    this.setState({ renewsMsges })

    let renewsTx
    let renewsTxLink
    let renewsOverrides = {}
    if (conf.custom.wallet.gasPrice > 0) { // conf.custom.wallet.gasPrice: gwei
      renewsOverrides.gasPrice = utils.parseUnits(String(conf.custom.wallet.gasPrice), 'gwei')
    }
    //renewsOverrides.gasLimit = 120000   // !!!!!
    renewsOverrides.value = (await BulkRenewCon.rentPrice(renewList, duration)).mul(105).div(100)

    try { 
      renewsTx = await BulkRenewCon.renewAll(renewList, duration, renewsOverrides)
      renewsTxLink = '<a href="' + confFixed.scanConf[network] + 'tx/' + renewsTx.hash + '" target="_blank" rel="noreferrer">' + t('c.tx') + '</a>'

      renewsMsges.push({
        time: moment(), 
        type: "info", 
        text: t('modal.renews.renews10', { txLink: renewsTxLink })
      }) 
      this.setState({ renewsMsges })
    } catch(e) {
      console.log(e)
      renewsMsges[0] = {
        time: moment(), 
        type: "action", 
        text: "renewsSuspended" 
      }
      this.setState({ renewsMsges })
      return
    }
    
    const renewsTxReceipt = await provider.waitForTransaction(renewsTx.hash, 1)

    if (renewsTxReceipt.status) {
      renewsMsges.push({
        time: moment(), 
        type: "info", 
        text: t('modal.renews.renews11.succeed', { txLink: renewsTxLink })
      }) 
      renewsMsges[0] = { 
        time: moment(), 
        type: "action", 
        text: "renewsSucceeded" 
      }
      this.setState({ renewsMsges })
    } else {
      renewsMsges.push({
        time: moment(), 
        type: "info", 
        text: t('modal.renews.renews11.fail', { txLink: renewsTxLink })  
      }) 
      renewsMsges[0] = { 
        time: moment(), 
        type: "action", 
        text: "renewsFailed" 
      }
      this.setState({ renewsMsges })
    }
  }

  renewNamesEnd = async (renewList) => {
    this.setState({ renewsMsges: INITIAL_STATE.renewsMsges })
    await this.updateNames(renewList)
    await this.updateBalance()
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

  estimateCosts = async (regList) => {
    let costWei = ethers.BigNumber.from(0)

    for (let i = 0; i < regList.length; i++) {
      costWei = costWei.add(await this.estimateCost(regList[i]))
    }
    return costWei
  }

  // getProviderAndSigner() return a provider, a signer and a wallet type.
  // wallet type: 'custom' | 'web3' | 'readonly'
  getProviderAndSigner = async () => {
    if (isCustomWallet(conf)) {
      let provider = new ethers.providers.InfuraProvider(conf.custom.wallet.network, conf.custom.infuraID)
      const signer = new ethers.Wallet(conf.custom.wallet.operatorPrivateKey[0], provider)
      return { provider, signer, type: 'custom' }
    } 
    //return await getWeb3Modal(fallback)
    let provider
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

  getETHPrice = async () => {
    const { provider, network } = this.state
    const ETHPriceFeedCon = getETHPriceFeedCon(provider, network, conf)
    const currentETHPrice = await ETHPriceFeedCon.latestAnswer()
    return currentETHPrice.toNumber()
  }

  subscribeProvider = async (provider) => {
    if (!provider.on) {
      return
    }
    //provider.on("close", () => this.resetApp());
    provider.on("accountsChanged", async (accounts) => {
      if (this.state.type !== 'web3') {
        return console.log('Your switch only works in Web3 mode.')
      }
      this.reconnectApp(false)
    })
    provider.on("chainChanged", async (chainId) => {
      if (this.state.type !== 'web3') {
        return console.log('Your switch only works in Web3 mode.')
      }
      if (isSupportedChain(parseInt(chainId, 16))) {
        this.setState({ unsupported: false })
        this.reconnectApp()
      } else {
        this.setState({ unsupported: true })
      }
    })
  }

  render() {
    const { 
      reconnecting, 
      fetching, 
      unsupported, 
      nameInfo, 
      type, 
      regMsges, regsMsges, renewMsges, renewsMsges,
      address, ensname, network, balance, ethPrice,
      provider
    } = this.state

    const walletInfo = { type, address, ensname, network, balance }
    document.title = conf.custom.pageTag ? `${conf.custom.pageTag} - ${conf.projectName}` : conf.projectName

    return (
      <div id="main-wrapper" className="container main-wrapper">
        <Header 
          conf={conf}
          confFixed={confFixed}
          walletInfo={walletInfo}
          reconnectApp={this.reconnectApp}
          disconnectApp={this.disconnectApp}
          reconnecting={reconnecting}
          setAndStoreConfInfo={this.setAndStoreConfInfo}
        />
        <MainForm 
          nameInfo={nameInfo}
          setAndStoreNameInfo={this.setAndStoreNameInfo}
          updateNames={this.updateNames}
          network={network}
          provider={provider}
        />
        <MainTable 
          conf={conf}
          nameInfo={nameInfo} 
          reconnectApp={this.reconnectApp}
          type={type}
          address={address}
          network={network}
          ethPrice={ethPrice}
          reconnecting={reconnecting}
          fetching={fetching}
          updateNames={this.updateNames} 
          registerName={this.registerName} 
          registerNames={this.registerNames}
          registerNameEnd={this.registerNameEnd}
          registerNamesEnd={this.registerNamesEnd}
          renewName={this.renewName}
          renewNameEnd={this.renewNameEnd}
          renewNames={this.renewNames}
          renewNamesEnd={this.renewNamesEnd}
          estimateCost={this.estimateCost}
          estimateCosts={this.estimateCosts}
          regMsges={regMsges}
          regsMsges={regsMsges}
          renewMsges={renewMsges}
          renewsMsges={renewsMsges}
          getDefaultNameReceiver={this.getDefaultNameReceiver}
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
