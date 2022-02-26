import { ethers } from "ethers";
import Web3Modal from "web3modal";
// import { getWeb3 } from "./web3Modal";
import confFile from '../../conf.json'

let web3Modal
let provider

export function isConnected() {
  return Boolean(web3Modal)
}

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

// getProviderAndSigner() return a provider, a signer and a wallet type.
// wallet type: 'custom' | 'web3' | 'readonly'
export async function getProviderAndSigner() {
  const conf = getConf()
  
  if (isCustomWallet(conf)) {
    const provider = new ethers.providers.InfuraProvider(conf.custom.network, conf.custom.infuraID)
    const signer = new ethers.Wallet(conf.custom.operatorPrivateKey[0], provider)
    return { provider, signer, type: 'custom' }
  } 
  return await getWeb3Modal()
}

export async function getWeb3Modal() {
  const instance = await createWeb3Modal()
  if (instance) {
    provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    return { provider, signer, type: 'web3' }
  }
  else {
    provider = ethers.getDefaultProvider()
    return { provider, signer: undefined, type: 'readonly' }
  }
}

export async function createWeb3Modal() {
  try {
    web3Modal = new Web3Modal({
      // network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions // required
    })
    const instance = await web3Modal.connect()

    return instance
  } 
  catch(e) {
    console.log(e)
    return null
  }
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

const providerOptions = {
  walletconnect: {
    package: () => import('@walletconnect/web3-provider'), // required
    packageFactory: true,
    options: {
      infuraId: getConf().custom.infuraID // required
    }
  }
}

// export async function getWeb3Modal() {
//   try {
//     web3Modal = new Web3Modal({
//       // network: "mainnet", // optional
//       cacheProvider: true, // optional
//       providerOptions // required
//     });
    
//     const instance = await web3Modal.connect();
//     console.log(instance)
//     provider = new ethers.providers.Web3Provider(instance);
//     const signer = provider.getSigner();

//     return { provider, signer }
//   } 
//   catch(e) {
//     console.log(e)
//     provider = ethers.getDefaultProvider()
//     return { provider, signer: undefined }
//   }
// }
