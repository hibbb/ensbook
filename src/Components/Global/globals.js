import confFile from '../../conf.json'
import { Contract } from 'ethers'

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
