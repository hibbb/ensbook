import React from 'react'
import { ethers, utils, Contract } from 'ethers'
import moment from 'moment'
import 'moment/locale/zh-cn'
import lt from 'long-timeout'
import Web3Modal from "web3modal";
import { getConf, clearWeb3Modal, isCustomWallet } from './Components/Global/globals'
import Header from './Components/Header/Header'
import MainForm from './Components/Form/MainForm'
import MainTable from './Components/Table/MainTable'
import Footer from './Components/Footer/Footer'
import TestBar from './Components/Utils/TestBar'
import MessageToasts from './Components/Utils/MessageToasts'

//let conf = getConf()

const INITIAL_STATE = {
  fetching: false,
  provider: ethers.getDefaultProvider(),
  signer: null,
  type: "readonly",
  address: null,
  ensname: null,
  network: null,
  balance: null,
  nameInfo: (
    window.localStorage.getItem("nameInfo")
    ? JSON.parse(window.localStorage.getItem("nameInfo"))
    : []
  )
  //pendingRequest: false,
  //result: null
};

class ENSBook extends React.Component {
  t = this.props.t

  constructor(props) {
    super(props)
    this.state = INITIAL_STATE

    const conf = getConf()
    // store the newest lookupList to localstorage, keep the list in configform up to date.
    const lookupList = Object.keys(conf.custom.display.lookup)
    window.localStorage.setItem('lookupList', JSON.stringify(lookupList))
  }

  reconnectApp = async (updateNamesFlag = true) => {
    const { provider, signer, type } = await this.getProviderAndSigner()
    //await this.subscribeProvider(provider)
    //await provider.enable()
    this.setState({ provider, signer, type })

    const address = signer ? await signer.getAddress() : null
    const network = (await provider.getNetwork()).name
    const balance = address ? utils.formatEther(await provider.getBalance(address)) : null
    const ensname = address ? await provider.lookupAddress(address) : null
    this.setState({ address, network, balance, ensname })

    if (updateNamesFlag) {
      this.updateNames()
    } 
  }

  // getProviderAndSigner() return a provider, a signer and a wallet type.
  // wallet type: 'custom' | 'web3' | 'readonly'
  getProviderAndSigner = async () => {
    const conf = getConf()
    let provider
    let web3Modal
    if (isCustomWallet(conf)) {
      provider = new ethers.providers.InfuraProvider(conf.custom.network, conf.custom.infuraID)
      const signer = new ethers.Wallet(conf.custom.operatorPrivateKey[0], provider)
      return { provider, signer, type: 'custom' }
    } 
    //return await getWeb3Modal(fallback)
    try {
      web3Modal = new Web3Modal({
        //network: this.state.network, // optional
        cacheProvider: true, // optional
        providerOptions: {
          walletconnect: {
            package: () => import('@walletconnect/web3-provider'), // required
            packageFactory: true,
            options: {
              infuraId: conf.custom.infuraID // required
            }
          }
        }
      })
      provider = await web3Modal.connect()

      if (provider) {
        await this.subscribeProvider(provider)
        await provider.enable()
        provider = new ethers.providers.Web3Provider(provider);
        const signer = provider.getSigner();
        return { provider, signer, type: 'web3' }
      }
      else {
        provider = ethers.getDefaultProvider()
        return { provider, signer: undefined, type: 'readonly' }
      }
    } 
    catch(e) {
      console.log(e)
      return null
    }
  }

  disconnectApp = async () => {
    await clearWeb3Modal()
    this.setState(INITIAL_STATE)
    this.updateNames()
  }

  subscribeProvider = async (provider) => {
    if (!provider.on) {
      return;
    }
    //provider.on("close", () => this.resetApp());
    provider.on("accountsChanged", async (accounts) => {
      console.log("accountsChanged")
      this.reconnectApp(false)
    });
    // provider.on("chainChanged", async (chainId) => {
    //   console.log("chainChanged")
    //   this.reconnectApp()
    // });
    provider.on("networkChanged", async (networkId) => {
      console.log("networkChanged")
      this.reconnectApp()
    });
  };

  setAndStoreNameInfo = (value, messageShow = true) => { // update nameInfo in state and store it
    this.setState({"nameInfo": value})
    window.localStorage.setItem("nameInfo", JSON.stringify(value))
    if (messageShow) {
      this.MessageToasts.messageShow("setAndStoreNameInfo", this.t('msg.setAndStoreNameInfo'), "msg-default", "true", "5000")  
    }
  }

  getExpiresTimeStamp = async (label) => {
    const conf = getConf()
    //const { provider } = await getProviderAndSigner()
    const { provider } = this.state  // tobesolved: multi: getDefaultProvider() need the [network]
    const BaseRegImpCon = new Contract(
      conf.fixed.contract.addr[conf.custom.network].BaseRegImp, 
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
    console.log('Updated Names.')
  }

  register = async (label) => {
    const conf = getConf()

    let owner = conf.custom.receiverAddress      // address
    let duration = moment.duration(conf.custom.regTxConf.duration, 'years').asSeconds() // years to seconds
    let ourValue = conf.custom.regTxConf.value  // Ether

    const { provider, signer } = this.state
    const { nameInfo } = this.state

    const ETHRegCtrlCon = new Contract(
      conf.fixed.contract.addr[conf.custom.network].ETHRegCtrl, 
      conf.fixed.contract.abi.ETHRegCtrl, 
      signer)
    // set the status of the name to 'Regsitering', but no storing
    nameInfo.find(item => item.label === label).status = 'Registering'
    this.setState({ nameInfo: nameInfo })

    owner = utils.isAddress(owner) ? owner : await signer.getAddress()
    duration = Math.max(  // duration is in seconds now
      duration, 
      moment.duration(conf.fixed.ensConf.MIN_REGISTRATION_DURATION, 'days').asSeconds()
    )

    const secret = ethers.Wallet.createRandom().privateKey
    window.localStorage.setItem("lastCommit", `{ name: ${label}, owner: ${owner}, secret: ${secret} }`)

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
      this.t('msg.register00', { 
        label: label, 
        owner: owner.substr(0, 7) + '...', 
        duration: moment.duration(duration, 'seconds').asYears()
      })
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
    if (conf.custom.regTxConf.gasLimit > 0) {
      regOverrides.gasLimit = conf.custom.regTxConf.gasLimit
    }
    if (ourValue.length < 1 || ourValue === '0') {
      ourValue = await ETHRegCtrlCon.rentPrice(label, duration)
      regOverrides.value = ourValue
    } else {
      regOverrides.value = utils.parseEther(ourValue)
    }

    const tx30 = await ETHRegCtrlCon.registerWithConfig(label, owner, duration, secret, resolverAddr, resolveToAddr, regOverrides)
    const tx31 = await provider.waitForTransaction(tx30.hash, conf.custom.regTxConf.waitConfirms)
    const regTxLink = '<a href="' + conf.fixed.scanConf[conf.custom.network] + 'tx/' + tx30.hash + '" target="_blank" rel="noreferrer">' + this.t('c.tx') + '</a>'

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

  getRegistrableNames = () => {
    return this.state.nameInfo.filter((nameItem, i) => {
      return nameItem.status === 'Open' || nameItem.status === "Reopen" || nameItem.status === "Premium"
    })
  }

  registerAll = async () => {
    const registrableNames = this.getRegistrableNames()
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

  estimatePrice = async (
    label, 
    messageShow = true, 
    commitGasPrice,
    regGasPrice
    ) => {
    
    const conf = getConf()
    // const { provider } = await getProviderAndSigner()
    const { provider } = this.state

    const ETHRegCtrlCon = new Contract(
      conf.fixed.contract.addr[conf.custom.network].ETHRegCtrl, 
      conf.fixed.contract.abi.ETHRegCtrl, 
      provider
    )
    const duration = Math.max(  // duration is in seconds now
      moment.duration(conf.custom.regTxConf.duration, 'years').asSeconds(),
      moment.duration(conf.fixed.ensConf.MIN_REGISTRATION_DURATION, 'days').asSeconds()
    )
    const commitGasLimit = "50000"
    const regGasLimit = "270000"
    const rent = await ETHRegCtrlCon.rentPrice(label, duration)

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
    const conf = getConf()
    //const { provider } = await getProviderAndSigner()
    const { provider } = this.state

    let cg
    let rg
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

    const registrableNames = this.getRegistrableNames()
    let priceWei = ethers.BigNumber.from(0)
    for (let i = 0; i < registrableNames.length; i++) {
      priceWei = priceWei.add(
        await this.estimatePrice(registrableNames[i].label, false, cg, rg)
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
    const { nameInfo } = this.state
    Promise.all(nameInfo.filter((nameItem, i) => {return i !== index}))
    .then((nameInfo) => {
      this.setAndStoreNameInfo(nameInfo)
    })
  }
  
  removeNames = () => {
    this.setAndStoreNameInfo([])
  }

  render() {
    const conf = getConf()
    const { nameInfo, type, address, ensname, network, balance } = this.state
    const walletInfo = { type, address, ensname, network, balance }
    document.title = conf.custom.pageTag ? `${conf.custom.pageTag}-${conf.projectName}` : conf.projectName

    return (
      <div id="main-wrapper" className="container main-wrapper">
        <Header 
          conf={conf}
          walletInfo={walletInfo}
          reconnectApp={this.reconnectApp}
          disconnectApp={this.disconnectApp}
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
          nameInfo={nameInfo} 
          conf={conf}
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
        <Footer />
        <TestBar />
        <MessageToasts onRef={(ref)=>{this.MessageToasts=ref}} />
      </div>
    )
  }
}

export default ENSBook;
