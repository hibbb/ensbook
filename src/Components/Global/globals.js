import confFile from '../../conf.json'
import { Contract } from 'ethers'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
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

  if (oldList.sort().toString() !== newList.sort().toString()) {
    conf.custom.display.lookup = confFile.custom.display.lookup
    window.localStorage.setItem("confInfo", JSON.stringify(conf))
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

export function getNameItemByLabel(label, nameInfo) {
  return nameInfo.filter(nameItem => nameItem.label === label)[0] // return a struct item
}

export function haveRegistrableNames(nameInfo) {
  return nameInfo.findIndex(row => isRegistrable(row.status)) > -1
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
    if (!commitTxReceipt) {
      return 0
    }
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

export async function getNames(labelsGroup, nameInfo, provider, network) {
  if (labelsGroup.length > 100) {
    return nameInfo
  }

  const subgraphUri = network === "ropsten"
    ? 'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten'
    : 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'

  const namesQuery = `
    query($labelsGroup: [String!]) {
      registrations(where: {labelName_in: $labelsGroup}) {
        labelName,
        id,
        expiryDate,
        registrationDate,
        registrant {
          id
        }
      }
    }
  `
  const client = new ApolloClient({
    uri: subgraphUri,
    cache: new InMemoryCache(),
  })

  const data = await client.query({
    query: gql(namesQuery),
    variables: {labelsGroup: labelsGroup},
  })

  const { registrations } = data.data

  for (let i = 0; i < labelsGroup.length; i++) {
    const ri = registrations.findIndex(item => item.labelName === labelsGroup[i])
    const ni = nameInfo.findIndex(item => item.label === labelsGroup[i])

    if (ri < 0) {
      nameInfo[ni].status = 'Open'
      nameInfo[ni].expiresTime = 0
      nameInfo[ni].releaseTime = 0 
      nameInfo[ni].registrationTime = 0
    } else {
      const expiresTime = moment.unix(registrations[ri].expiryDate)
      const releaseTime = moment.unix(registrations[ri].expiryDate).add(90, 'days')
      
      nameInfo[ni].registrationTime = Number(registrations[ri].registrationDate)
      nameInfo[ni].expiresTime = expiresTime.unix()
      nameInfo[ni].releaseTime = releaseTime.unix()

      if (moment().isSameOrBefore(expiresTime)) {
        nameInfo[ni].status = 'Normal'
        nameInfo[ni].owner = registrations[ri].registrant.id
      } else if (moment().isSameOrBefore(releaseTime)) {
        nameInfo[ni].status = 'Grace'
        nameInfo[ni].owner = registrations[ri].registrant.id
      } else if (moment().subtract(21, 'days').isSameOrBefore(releaseTime)) { 
        nameInfo[ni].status = 'Premium'
      } else if (moment().subtract(21, 'days').isAfter(releaseTime)) {
        nameInfo[ni].status = 'Reopen'
      } else {
        nameInfo[ni].status = 'Unknown'
      }
    }

    if (nameInfo[ni].regStep > 0) {
      nameInfo[ni].regStep = await updateRegStep(nameInfo[ni].label, nameInfo[ni].regStep, provider)
    }
  }

  return nameInfo
}
