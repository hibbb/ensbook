import confFile from '../../conf.json'

let web3Modal
let provider

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

export function isCustomWallet(conf) {
  conf = conf ?? getConf()
  return Boolean(conf.custom.operatorPrivateKey[0])
}

export async function clearWeb3Modal() {
  if (web3Modal) {
    await web3Modal.clearCachedProvider()
  }

  // Disconnect wallet connect provider
  if (provider && provider.disconnect) {
    provider.disconnect()
  }
}

