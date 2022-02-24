import { ethers } from "ethers";
import confFile from '../conf.json'

function getConfiguration() {
  if (confFile.host === "remote") {
    let conf = JSON.parse(window.localStorage.getItem("confInfo"))
    if (!conf) {
      conf = confFile
      this.storeContent("confInfo", JSON.stringify(conf))
    }
    return conf
  }
  return confFile
}

export function getConf() {
  return getConfiguration()
}

export function getProvider(conf = null) {
  conf = conf ?? getConfiguration()
  return new ethers.providers.InfuraProvider(conf.custom.network, conf.custom.infuraID)
}

export function getWallet(conf = null) {
  conf = conf ?? getConfiguration()
  return new ethers.Wallet(conf.custom.operatorPrivateKey[0]);
}

export function getSignerWithProvider(conf = null, provider = null) {
  conf = conf ?? getConfiguration()
  return new ethers.Wallet(conf.custom.operatorPrivateKey[0], provider ?? getProvider());
}

