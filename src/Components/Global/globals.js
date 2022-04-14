import confFile from '../../conf.json'
import { Contract } from 'ethers'
import moment from 'moment'

export function getConf() {
  if (confFile.host === "remote") {
    let confStored = JSON.parse(window.localStorage.getItem("confInfo"))
    if (!confStored) {
      confStored = confFile
      window.localStorage.setItem("confInfo", JSON.stringify(confStored))
    }
    return confStored
  }
  return confFile
}

export function updateLookupList(conf) {
  conf = conf ?? getConf()
  const oldList = Object.keys(conf.custom.display.lookup)
  const newList = Object.keys(confFile.custom.display.lookup)
  // update lookupList in localStorage
  window.localStorage.setItem("lookupList", JSON.stringify(newList))

  if (oldList.length !== newList.length) {
    conf.custom.display.lookup = confFile.custom.display.lookup
  }
  return conf
}

export function getETHRegCtrlCon(providerOrSigner, network, conf) {
  conf = conf ?? getConf()
  const contractAddr = conf.fixed.contract.addr[network].ETHRegCtrl
  const contractAbi = conf.fixed.contract.abi.ETHRegCtrl
  return new Contract(contractAddr, contractAbi, providerOrSigner)
}

export function getBaseRegImpCon(providerOrSigner, network, conf) {
  conf = conf ?? getConf()
  const contractAddr = conf.fixed.contract.addr[network].BaseRegImp
  const contractAbi = conf.fixed.contract.abi.BaseRegImp
  return new Contract(contractAddr, contractAbi, providerOrSigner)
}

export function isCustomWallet(conf) {
  conf = conf ?? getConf()
  return conf.custom.wallet.switch
}

export function isSupportedChain(key) {
  if (typeof(key) === 'string') {
    return ["homestead", "mainnet", "ropsten"].findIndex(item => item === key) > -1
  }
  if (typeof(key) === 'number') {
    return [1, 3].findIndex(item => item === key) > -1
  }
}

export function isRegistrable(status) {
  return status === "Open" || status === "Reopen" || status === "Premium"
}

export function getRegistrableNames(nameInfo) {
  return nameInfo.filter(nameItem => isRegistrable(nameItem.status))
}

export function haveUnregistrableNames(nameInfo) {
  return nameInfo.findIndex(row => !isRegistrable(row.status)) > -1
}

export function isRenewable(status) {
  return status === "Normal" || status === "Grace"
}

export function haveRenewableNames(nameInfo) {
  return nameInfo.findIndex(row => isRenewable(row.status)) > -1
}

export function storeRegInfo(label, regInfo) {
  // regInfo: { owner, duration, secret, resolver, addr, commitment, commitTxHash,regTxHash }
  window.localStorage.setItem("regInfo-" + label, JSON.stringify(regInfo))
}

export function getRegInfo(label) {
  return JSON.parse(window.localStorage.getItem("regInfo-" + label))
}

export async function updateRegStep(label, regStep, provider) {
  if (regStep === 0 || regStep === 3) {
    removeRegInfo(label)
    return 0
  }

  const regInfo = getRegInfo(label)

  if (!regInfo) {
    return 0
  }

  let commitTxReceipt
  let commitTxTime
  let regWindow = {}

  if (regInfo.commitTxHash) { 
    commitTxReceipt = await provider.getTransactionReceipt(regInfo.commitTxHash)
  } else {
    return regStep
  }

  if (commitTxReceipt) {
    commitTxTime = (await provider.getBlock(commitTxReceipt.blockNumber)).timestamp
  } else { 
    return regStep
  }

  if (regStep === 0.5) {
    regStep = 1
  }

  if (regStep > 0.5) {
    regWindow.start = moment.unix(commitTxTime).add(60, 'seconds')
    regWindow.end = moment.unix(commitTxTime).add(7, 'days')
    regStep = moment().isBefore(regWindow.end) ? regStep : 0
  }

  if (regStep === 1) {
    regStep = moment().isAfter(regWindow.start) ? 2 : regStep
  }

  if (regStep === 2.5) {
    const regTxReceipt = await provider.getTransactionReceipt(regInfo.regTxHash)
    if (regTxReceipt) { 
      regStep = regTxReceipt.status ? 3 : 0
    } // if regTxReceipt is null reStep is still 2.5
  }

  return regStep
}

export function removeRegInfo(label) {
  window.localStorage.removeItem("regInfo-" + label)
}
