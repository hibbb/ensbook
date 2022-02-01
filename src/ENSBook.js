import React, {Component} from 'react'
import { ethers, utils, Contract } from 'ethers'
import confFile from './conf.json'
import moment from 'moment'
import 'moment/locale/zh-cn'
import lt from 'long-timeout'
import NamesDisplayTable from './NamesDisplayTable'
import AddNamesForm from './AddNamesForm'
import namehash from '@ensdomains/eth-ens-namehash'
import ConfigureForm from './Utils/ConfigureForm'
import MessageToasts from './Utils/MessageToasts'
import LanguageSwitcher from './Utils/LanguageSwitcher'
import AppTitle from './Utils/AppTitle'
import packageJson from '../package.json'
import { Github, Twitter } from 'react-bootstrap-icons';

let provider
let walletWithProvider
let conf

class ENSBook extends Component {
  t = this.props.t

  constructor(props) {
    super(props)

    try {
      if (!window.localStorage) {
        throw new Error("Your browser must support LocalStorage to use this APP.")
      }
    } catch (error) {
      throw error
    }

    // setState: nameInfo
    const nameInfoStr = window.localStorage.getItem("nameInfo")
    const nameInfo = nameInfoStr !== null ? JSON.parse(nameInfoStr) : []
    // store the newest lookupList to localstorage, keep the list in configform up to date.
    const lookupList = Object.keys(confFile.custom.display.lookup)
    window.localStorage.setItem('lookupList', JSON.stringify(lookupList))
    // setState: conf
    if (confFile.host === "remote") {
      conf = JSON.parse(window.localStorage.getItem("confInfo"))
      if (!conf) {
        conf = confFile
        this.storeContent("confInfo", JSON.stringify(conf))
      }      
    } else {
      conf = confFile
    }
    //setState walletInfo
    try {
      if (conf.custom.infuraID.trim().length >= 1) {
        provider = new ethers.providers.InfuraProvider(conf.custom.network, conf.custom.infuraID)
        walletWithProvider = new ethers.Wallet(conf.custom.operatorPrivateKey[0], provider);
      } else {
        throw new Error("You must correctly configure the conf.json file at first.")
      }
    } catch (error) {
      throw error
    }
    const walletInfo = { address: walletWithProvider.address, balance: "" }
    this.state = {nameInfo: nameInfo, walletInfo: walletInfo}
  }

  storeContent = (key, value) => {  // store content at localStorage and return a bool
    window.localStorage.setItem(key, value)
    return true  
  }

  getAndStoreWalletInfo = async () => { // update walletInfo in state
    const walletAddress = walletWithProvider.address
    const walletBalance = utils.formatEther(await walletWithProvider.getBalance())
    const walletInfo = { "address": walletAddress, "balance": walletBalance }
    this.setState({walletInfo: walletInfo})
    return walletInfo
  }

  setAndStoreNameInfo = (value, messageShow = true) => { // update nameInfo in state and store it
    this.setState({"nameInfo": value})
    const isStored = this.storeContent("nameInfo", JSON.stringify(value))
    if (messageShow) {
      this.MessageToasts.messageShow(
        "setAndStoreNameInfo", 
        isStored ? this.t('msg.setAndStoreNameInfo.succeed') : this.t('msg.setAndStoreNameInfo.fail'),
        isStored ? "msg-default" : "msg-warning",
        "true",
        "5000"
      )  
    }
  }

  setAndStoreConfInfo = (value) => { // update confInfo in variable "conf" and store it
    const isStored = this.storeContent("confInfo", JSON.stringify(value))
    if (isStored) {
      conf = value
      provider = new ethers.providers.InfuraProvider(conf.custom.network, conf.custom.infuraID)
      walletWithProvider = new ethers.Wallet(conf.custom.operatorPrivateKey[0], provider);
    }
    this.MessageToasts.messageShow(
      "setAndStoreConfInfo", 
      isStored ? this.t('msg.setAndStoreConfInfo.succeed') : this.t('msg.setAndStoreConfInfo.fail'),
      isStored ? "msg-default" : "msg-warning"
    )
  }

  resetAndStoreConfInfo = () => {
    this.setAndStoreConfInfo(confFile)
  }

  getLabels = () => {
    return this.state.nameInfo.map(item => item.label).join(' ')
  }

  getExpiresTimeStamp = async (label) => {
    const BaseRegImpCon = new Contract(
      conf.fixed.contract.addr[conf.custom.network].BaseRegImp, 
      conf.fixed.contract.abi.BaseRegImp, 
      walletWithProvider)
    const tokenId = utils.id(label)
    const expiresTimeBignumber = await BaseRegImpCon.nameExpires(tokenId) // return a BigNumber Object
    return expiresTimeBignumber.toNumber() // unix timestamp
  }

  logOperators = async () => {
    let keys = conf.custom.operatorPrivateKey
    console.log('Operators:')
    for (let i = 0; i < keys.length; i ++) {
      const op = (new ethers.Wallet(keys[i])).address
      console.log('%s...%s : %s', op.slice(0, 7), op.slice(-5), utils.formatEther(await provider.getBalance(op)).slice(0,7))
    }
  }

  updateName = async (index, messageShow = true) => {
    const {nameInfo} = this.state
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
      } else if (nowT <= releaseTime.add(28, 'days')) {
        nameInfo[index].status = 'Premium'
      } else if (nowT > releaseTime.add(28, 'days')) {
        nameInfo[index].status = 'Reopen'
      } else {
        nameInfo[index].status = 'Unknown'
      }
    }
    this.setAndStoreNameInfo(nameInfo, messageShow)
    return expiresTimeStamp
  }

  updateNameByLabel = async (label, messageShow = true) => {
    const index = this.state.nameInfo.findIndex(item => item.label === label)
    return this.updateName(index, messageShow)
  }

  updateNames = async (messageShow = true) => {
    this.state.nameInfo.map(async (row, index) => {
      return await this.updateName(index, messageShow)
    })
    this.getAndStoreWalletInfo()
  }

  addNames = async (labels) => {
    const {nameInfo} = this.state
    labels = labels.replace(/[,.'"?!@#$%^&*()]/g, ' ').trim()
    if (labels.length < 1) {
      return false
    }
    // create an Array(originLabelsSet) including the original labels
    const originLabelsSet = new Set()
    nameInfo.map(row => originLabelsSet.add(row.label))
    // split the string by spaces to labels and remove duplicates
    const newLabelsSet = new Set(labels.split(/\s+/));
    // only retain the labels whose length >= 3
    let newLabelsArr = [...newLabelsSet].filter(label => label.length >= 3)
    try {
      newLabelsArr.map((label, index) => newLabelsArr[index] = namehash.normalize(label))
    } catch (err) {
      this.MessageToasts.messageShow(
        "nameNormalizeError", 
        this.t('msg.nameNormalizeError', {errMsg: err.message}),
        "msg-warning"
      )
    }
    // caculate the differences between the new and original labels, to avoid duplicates 
    let diffLabelsArr = [...new Set(newLabelsArr.filter(x => !originLabelsSet.has(x)))]; 

    const originNameInfoLen = nameInfo.length

    diffLabelsArr.map(label => 
      nameInfo.push({
        "label": label,
        "level": 0,
        "status": "Unknown",
        "tokenId": utils.id(label)
      })
    )
    this.setState({nameInfo: nameInfo})

    // update the status of newly added names
    for(let i = originNameInfoLen; i < nameInfo.length; i++) {
      this.updateName(i)
    }
  }

  levelUp = (index) => {
    const {nameInfo} = this.state
    nameInfo[index].level = (nameInfo[index].level + 1) % 2
    this.setAndStoreNameInfo(nameInfo, false)
  } 

  register = async (label, booked = false) => {
    let owner = conf.custom.receiverAddress      // address
    let duration = conf.custom.regTxConf.duration    // days
    let ourValue = conf.custom.regTxConf.value  // Ether

    const ETHRegCtrlCon = new Contract(
      conf.fixed.contract.addr[conf.custom.network].ETHRegCtrl, 
      conf.fixed.contract.abi.ETHRegCtrl, 
      walletWithProvider)
    // set the status of the name to 'Regsitering', but no storing
    const nameInfo = this.state.nameInfo
    nameInfo.find(item => item.label === label).status = booked ? 'Booked' : 'Registering'
    this.setState({nameInfo: nameInfo})

    owner = owner.trim().length < 1 ? walletWithProvider.address : owner
    duration = Math.max(duration, conf.fixed.ensConf.MIN_REGISTRATION_DURATION)
    const durationSeconds = moment.duration(duration, 'days').asSeconds()

    const secret = ethers.Wallet.createRandom().privateKey
    //secret = ethers.Wallet.createRandom().privateKey.slice(0, 54) + "eb" + moment().format("X")
    this.storeContent("lastCommitSecret", secret)

    let resolverAddr = "0x0000000000000000000000000000000000000000"
    let resolveToAddr = "0x0000000000000000000000000000000000000000"
    if (conf.custom.regTxConf.registerWithConfig) {
      resolverAddr = conf.fixed.contract.addr[conf.custom.network].PubRes
      resolveToAddr = owner
    }

    let commitOverrides = {} // config overrides 
    let regOverrides = {}

    this.MessageToasts.messageShow(
      "register00", 
      this.t('msg.register00', { label: label, owner: owner.substr(0, 7) + '...', duration: duration })
    )

    // Step 1.
    if (conf.custom.commitTxConf.gasPrice > 0) { // conf.custom.commitTxConf.gasPrice: gwei
      commitOverrides.gasPrice = utils.parseUnits(conf.custom.commitTxConf.gasPrice.toString(), 'gwei')
    }
    if (conf.custom.commitTxConf.gasLimit > 0) {
      commitOverrides.gasLimit = conf.custom.commitTxConf.gasLimit
    }
    let ourCommitment = await ETHRegCtrlCon.makeCommitmentWithConfig(label, owner, secret, resolverAddr, resolveToAddr)
    let tx10 = await ETHRegCtrlCon.commit(ourCommitment, commitOverrides)
    this.MessageToasts.messageShow(
      "register10", 
      this.t('msg.register10', { label: label })
    )
    let tx11 = await provider.waitForTransaction(tx10.hash, conf.custom.commitTxConf.waitConfirms)
    let commitTxLink = '<a href="' + conf.fixed.scanConf[conf.custom.network] + 'tx/' + tx10.hash + '" target="_blank" rel="noreferrer">' + this.t('c.tx') + '</a>'
    // if step 1 failed, cancel the process.
    if (tx11.status) {
      this.MessageToasts.messageShow(
        "register11", 
        this.t('msg.register11.succeed', { label: label, txLink: commitTxLink}),
        "msg-default",
        "true",
        "60000"
      )
    } else {
      this.MessageToasts.messageShow(
        "register11", 
        this.t('msg.register11.fail', { label: label, txLink: commitTxLink }),
        "msg-fail",
        "false"
      )  
      return await this.updateNameByLabel(label) 
    }

    // Step 2.
    const wait = ms => new Promise(resolve => lt.setTimeout(resolve, ms)) 
    // long-timeout is necessary for >24.8 days
    if (booked) {
      let expiresTimeStamp = await this.getExpiresTimeStamp(label)   // unix timestamp
      let diffT = moment.unix(expiresTimeStamp).add(90, 'days').diff(moment())
      let refreshT = parseInt(diffT / 2)   // as milisecs
      const activeDuration = moment.duration(24, 'hours')   // as milisecs
  
      this.bookFlags[label] = true
      // Cycle to get the latest status and prepare for registration
      while (diffT < activeDuration && diffT > 30000 && this.bookFlags[label]) {
        this.MessageToasts.messageShow(
          "book", 
          this.t('msg.book', { label: label, duration: moment.duration(refreshT).toISOString() })
        )
        await wait(refreshT)
        expiresTimeStamp = await this.getExpiresTimeStamp(label)
        nameInfo.find(item => item.label === label).expiresTime = expiresTimeStamp
        this.setState({nameInfo: nameInfo})    
        diffT = moment.unix(expiresTimeStamp).add(90, 'days').diff(moment())
        refreshT = parseInt(diffT / 2)
      }
      this.bookFlags[label] = false

      if (diffT < 30001 && diffT > 0) {
        await wait(diffT + conf.custom.book.timeSlot * 1000)
      } else {
        return await this.updateNameByLabel(label)
      }
    } else {
      // wait for 2nd pharse of registration
      await wait(conf.fixed.ensConf.minCommitmentAge * 1000) 
    }
    this.MessageToasts.messageShow(
      "register20", 
      this.t('msg.register20', { label: label }),
    )

    // Step 3.
    if (booked) {
      nameInfo.find(item => item.label === label).status = 'Registering'
      this.setState({nameInfo: nameInfo})  
    }
    if (conf.custom.regTxConf.gasPrice > 0) { // conf.custom.regTxConf.gasPrice: gwei
      regOverrides.gasPrice = utils.parseUnits(conf.custom.regTxConf.gasPrice.toString(), 'gwei')
    }
    if (conf.custom.regTxConf.gasLimit > 0) {
      regOverrides.gasLimit = conf.custom.regTxConf.gasLimit
    }
    if (ourValue.length < 1 || ourValue === '0') {
      ourValue = await ETHRegCtrlCon.rentPrice(label, durationSeconds)
      regOverrides.value = ourValue.mul(100 + conf.custom.donatePercentage).div(100)
    } else {
      regOverrides.value = utils.parseEther(ourValue)
    }

    const tx30 = await ETHRegCtrlCon.registerWithConfig(label, owner, durationSeconds, secret, resolverAddr, resolveToAddr, regOverrides)
    const tx31 = await provider.waitForTransaction(tx30.hash, conf.custom.regTxConf.waitConfirms)
    const donateEth = tx31.status ? await this.donate(tx30.value, walletWithProvider) : 0
    const regTxLink = '<a href="' + conf.fixed.scanConf[conf.custom.network] + 'tx/' + tx30.hash + '" target="_blank" rel="noreferrer">' + this.t('c.tx') + '</a>'

    if (tx31.status) {
      this.MessageToasts.messageShow(
        "register30", 
        this.t('msg.register30.succeed', { label: label, regTxLink: regTxLink, donationValue: donateEth }),
        "msg-success",
        "false"
      )
    } else {
      this.MessageToasts.messageShow(
        "register30", 
        this.t('msg.register30.fail', { label: label, regTxLink: regTxLink }),
        "msg-fail",
        "false"
      )      
    }
  
    // automaticly update the table after a registration
    this.getAndStoreWalletInfo()
    return await this.updateNameByLabel(label)
  }

  // Donate a few ethers to the author only when the donatePercentage > 0 as well as your register price >= 0.05 eth
  donate = async (value, wallet) => {
    let donateETH = 0
    if (conf.custom.donatePercentage > 0 && value.gte(utils.parseEther('0.05'))) {
      const donateValue = value.mul(conf.custom.donatePercentage).div(100)
      await wallet.sendTransaction({to: conf.author, value: donateValue})
      donateETH = utils.formatEther(donateValue)
    }
    return donateETH
  }

  nameRegistrable = () => {
    return this.state.nameInfo.filter((nameItem, i) => {
      return nameItem.status === 'Open' || nameItem.status === "Reopen"
    })
  }

  registerAll = async () => {
    const nameRegistrable = this.state.nameInfo.filter((nameItem, i) => {
      return nameItem.status === 'Open' || nameItem.status === "Reopen"
    })
    for (let i = 0; i < nameRegistrable.length; i++) {
      await this.register(nameRegistrable[i].label)
    }
  }

  bookFlags = {}

  book = (label) => {
    this.register(label, true)
  }

  cancelBook = (index) => {
    this.bookFlags[this.state.nameInfo[index].label] = false
    this.updateName(index)
  }

  estimatePrice = async (
    label, 
    messageShow = true, 
    commitGasPrice = null,
    regGasPrice = null
    ) => {
    const ETHRegCtrlCon = new Contract(
      conf.fixed.contract.addr[conf.custom.network].ETHRegCtrl, 
      conf.fixed.contract.abi.ETHRegCtrl, 
      walletWithProvider
    )
    const duration = (
      conf.custom.regTxConf.duration < conf.fixed.ensConf.MIN_REGISTRATION_DURATION
      ? conf.fixed.ensConf.MIN_REGISTRATION_DURATION
      : conf.custom.regTxConf.duration
    )
    const commitGasLimit = "50000"
    const regGasLimit = "270000"
    const durationSec = moment.duration(duration, 'days').asSeconds()
    const rent = await ETHRegCtrlCon.rentPrice(label, durationSec)

    commitGasPrice = commitGasPrice ?? (
      conf.custom.commitTxConf.gasPrice > 0 
      ? utils.parseUnits(conf.custom.commitTxConf.gasPrice.toString(), 'gwei')
      : await provider.getGasPrice()
    )
    regGasPrice = regGasPrice ?? (
      conf.custom.regTxConf.gasPrice > 0 
      ? utils.parseUnits(conf.custom.regTxConf.gasPrice.toString(), 'gwei')
      : await provider.getGasPrice()
    )

    const commitPrice = commitGasPrice.mul(commitGasLimit)
    const regPrice = regGasPrice.mul(regGasLimit)
    const priceWei = commitPrice.add(regPrice).add(rent)
    const priceEther = utils.formatEther(priceWei)

    if (messageShow) {
      this.MessageToasts.messageShow(
        "estimatePrice", 
        this.t('msg.estimatePrice', { label: label, price: priceEther.slice(0, 7) }),
      )  
    }
    return priceWei
  }

  estimatePriceAll = async () => {
    let cg = null
    let rg = null
    const cccg = conf.custom.commitTxConf.gasPrice
    const ccrg = conf.custom.regTxConf.gasPrice

    if (cccg > 0 && ccrg > 0) {
      cg = utils.parseUnits(cccg.toString(), 'gwei')
      rg = utils.parseUnits(ccrg.toString(), 'gwei')
    } else {
      const gasPrice = await provider.getGasPrice()
      cg = cccg > 0 ? utils.parseUnits(cccg.toString(), 'gwei') : gasPrice
      rg = ccrg > 0 ? utils.parseUnits(ccrg.toString(), 'gwei') : gasPrice
    }

    const nameRegistrable = this.nameRegistrable()
    let priceWei = ethers.BigNumber.from(0)
    for (let i = 0; i < nameRegistrable.length; i++) {
      priceWei = priceWei.add(
        await this.estimatePrice(nameRegistrable[i].label, false, cg, rg)
      )
    }
    const priceEther = utils.formatEther(priceWei)
    this.MessageToasts.messageShow(
      "estimatePriceAll", 
      this.t('msg.estimatePriceAll', { price: priceEther.slice(0, 7) }),
    )
    return priceWei
  }

  removeName = (index) => {
    const {nameInfo} = this.state
    Promise.all(nameInfo.filter((nameItem, i) => {return i !== index}))
    .then((nameInfo) => {
      this.setAndStoreNameInfo(nameInfo)
    })
  }
  
  removeNames = () => {
    this.setAndStoreNameInfo([])
  }

  render() {
    const {nameInfo, walletInfo} = this.state
    const walletAddr = walletInfo.address
    const walletScanLink = conf.fixed.scanConf[conf.custom.network] + "address/" + walletAddr
    document.title = conf.custom.pageTag.length > 0 ? conf.custom.pageTag + ' - ' + conf.projectName : conf.projectName

    return (
      <div id="main-wrapper" className="container main-wrapper">
        <div className="row mb-3">
          <div className="header-left col-md-6">
            <AppTitle pageTag={conf.custom.pageTag} pageTagColor={conf.custom.pageTagColor} />
          </div>
          <div className="header-right col-md-6 align-self-center">
            <LanguageSwitcher />
            <span className={"network px-2 network-"+ conf.custom.network}>{this.t('c.' + conf.custom.network)}</span>
            <span className="wallet-address">
              <a href={walletScanLink} target="_blank" rel="noreferrer" title={walletAddr}>
                {walletAddr.slice(0, 5) + '...' + walletAddr.slice(-4)}
              </a>
            </span>
            <span className="wallet-balance px-2">Ξ { walletInfo.balance.slice(0, 6) }</span>
            <ConfigureForm 
              host={conf.host}
              setAndStoreConfInfo={this.setAndStoreConfInfo} 
              resetAndStoreConfInfo={this.resetAndStoreConfInfo}
              confFile={confFile}
              updateNames={this.updateNames} 
              logOperators={this.logOperators}
              t={this.t}
            />
          </div>
        </div>
        <AddNamesForm 
          addNames={this.addNames} 
          t={this.t} 
          getLabels={this.getLabels}
        />
        <div className="row table-wrapper">
          <NamesDisplayTable 
            nameInfo={nameInfo} 
            conf={conf}
            levelUp={this.levelUp}
            updateName={this.updateName}
            updateNames={this.updateNames} 
            register={this.register} 
            registerAll={this.registerAll}
            removeName={this.removeName} 
            removeNames={this.removeNames}
            estimatePrice={this.estimatePrice}
            estimatePriceAll={this.estimatePriceAll}
            book={this.book}
            cancelBook={this.cancelBook}
            setAndStoreNameInfo={this.setAndStoreNameInfo}
            t={this.t}
          />
        </div>
        <div className="row">
          <div className="footnode-left align-self-center col-6">
            <div className="footnotes px-2">
              <a href="https://twitter.com/forlbb" target="_blank" rel="noreferrer"><Twitter /></a>
            </div>
          </div>
          <div className="footnode-right align-self-center col-6">
            <div className="footnotes px-2">
              <span className="current-version px-2">v{packageJson.version}</span>
              <a href={conf.repository} target="_blank" rel="noreferrer"><Github /></a>
            </div>
          </div>
        </div>
        <MessageToasts onRef={(ref)=>{this.MessageToasts=ref}} />
      </div>
    )
  }
}

export default ENSBook;
