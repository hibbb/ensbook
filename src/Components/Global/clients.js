import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = 
  window.ethereum 
  ? createPublicClient({ transport: custom(window.ethereum) })
  : createPublicClient({ chain: mainnet, transport: http() });

export const walletClient = async () => {
  const client = createWalletClient({ transport: custom(window.ethereum) });
  await subscribeProvider(client);
  return client;
}


const subscribeProvider = async (provider) => {   // need to deal
  if (!provider.on) {
    console.log('!provider.on')
    return;
  }
  provider.on('accountsChanged', async (accounts) => {
    console.log('accounts-changed')
    console.log(accounts)
    // if (this.state.type !== 'web3') {
    //   return console.log('Your switch only works in Web3 mode.');
    // }
    // this.reconnectApp(false);
  });
  provider.on('chainChanged', async (chainId) => {
    console.log('chainId-changed')
    console.log(chainId)
    // if (this.state.type !== 'web3') {
    //   return console.log('Your switch only works in Web3 mode.');
    // }
    // if (isSupportedChain(parseInt(chainId, 16))) {
    //   this.setState({ unsupported: false });
    //   this.reconnectApp();
    // } else {
    //   this.setState({ unsupported: true });
    // }
  });
};
