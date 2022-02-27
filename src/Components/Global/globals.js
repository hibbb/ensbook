import confFile from '../../conf.json'

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

