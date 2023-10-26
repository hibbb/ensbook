import React from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
import lt from 'long-timeout';
import { t } from 'i18next';
import {
  isSupportedChain,
  storeRegInfo,
  updateRegStep,
  getRegInfo,
  updateLookupList,
  isRegistrable,
  getNameItemByLabel,
  getConfFixed,
  queryNameInfo,
  fetchChainId,
  readCon,
  writeCon,
  getETHPrice,
} from './Components/Global/globals';
import Header from './Components/Header/Header';
import MainForm from './Components/Form/MainForm';
import MainTable from './Components/Table/MainTable';
import Footer from './Components/Footer/Footer';
import TestBar from './Components/Utils/TestBar';
import MessageToasts from './Components/Utils/MessageToasts';
import UnsupportedNetworkModal from './Components/Utils/UnsupportedNetworkModal';
import { createPublicClient, createWalletClient, custom, formatEther, http, keccak256, parseUnits, toHex } from 'viem';
import { mainnet, sepolia } from 'viem/chains'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { publicClient, walletClient } from './Components/Global/clients';
import { normalize } from 'viem/ens'
import { addrs } from './Components/Global/addrs';

let conf = updateLookupList(); // getConf() inside
const confFixed = getConfFixed();

const INITIAL_STATE = {
  regMsges: [{ time: moment(), type: 'action', text: 'regBefore' }], // for registerName process
  renewMsges: [{ time: moment(), type: 'action', text: 'renewBefore' }], // for renewName process
  renewsMsges: [{ time: moment(), type: 'action', text: 'renewsBefore' }], // for renewNames process
  reconnecting: false,
  fetching: false,
  unsupported: false,
  chainId: 1,
  ethPrice: undefined,
  walletAddress: undefined
};

class ENSBook extends React.Component {
  constructor(props) {
    super(props);
    const nameInfo = JSON.parse(window.localStorage.getItem('nameInfo')) ?? [];
    this.state = { ...INITIAL_STATE, nameInfo };
  }

  reconnectApp = async (updateNamesFlag = true) => {
    this.setState({ reconnecting: true });

    // use judgement to save time, need to deal, the 3 lines below
    const ethPrice = conf.custom.premium.priceUnit === 'ETH' ? await getETHPrice() : undefined;
    const [ walletAddress ] = await walletClient.getAddresses();
    const chainId = await fetchChainId();
    
    if (!isSupportedChain(chainId)) {
      console.log('chainId');
      console.log(chainId);
      return this.setState({ unsupported: true });
    }


    this.setState({ ethPrice, walletAddress, chainId});
    this.setState({ reconnecting: false });

    if (updateNamesFlag) {
      await this.updateNames();
    }
  };

  disconnectApp = async () => {
    // const { publicClient } = this.state;
    // await web3Modal?.clearCachedProvider();
    // // Disconnect wallet connect publicClient
    // if (publicClient && publicClient.disconnect) {
    //   publicClient.disconnect();
    // }
    this.setState({ ...INITIAL_STATE });
    this.updateNames();
  };

  setAndStoreConfInfo = (newConf) => {
    conf = newConf; // renew the global variable: conf
    window.localStorage.setItem('confInfo', JSON.stringify(conf));
  };

  setAndStoreNameInfo = (nameInfo, messageShowFlag = true) => {
    // update nameInfo in state and store it
    this.setState({ nameInfo });
    window.localStorage.setItem('nameInfo', JSON.stringify(nameInfo));
    if (messageShowFlag) {
      this.MessageToasts.messageShow(
        'setAndStoreNameInfo',
        t('msg.setAndStoreNameInfo')
      );
    }
  };

  getExpiresTimeStamp = async (label) => {
    const tokenId = keccak256(toHex(label));
    const chainId = await fetchChainId()
    const expiresTimeBignumber = await readCon('BaseRegImp', chainId, 'nameExpires', { id: tokenId }); // return a BigNumber Object
    return Number.parseInt(expiresTimeBignumber); // unix timestamp
  };

  getDefaultNameReceiver = async () => {
    if (conf.custom.register.receiver) {
      return conf.custom.register.receiver
    }
    const [ address ] = await walletClient.getAddresses();
    const ensName = await publicClient.getEnsName({ address });
    return ensName ?? address;
  };

  updateNames = async (labels, messageShowFlag = true) => {
    let { nameInfo } = this.state;
    labels = labels ?? nameInfo.map((item) => item.label);
    const labelsGroupsCount = Math.ceil(labels.length / 100);

    this.setState({ fetching: true });

    for (let n = 0; n < labelsGroupsCount; n++) {
      const labelsGroup = labels.slice(n * 100, n * 100 + 100);
      nameInfo = await queryNameInfo(labelsGroup, nameInfo);
      this.setAndStoreNameInfo(nameInfo, messageShowFlag);
    }
    this.setState({ fetching: false });
  };

  isRegistrableNow = async (label, nameInfo) => {
    await this.updateNames([label], false);
    return isRegistrable(getNameItemByLabel(label, nameInfo).status);
  };

  // registerName actions: regBefore, regStarted, regSupended, regSucceeded, regFailed

  registerName = async (label, duration, receiver, regFrom = 0, regTo = 3) => {
    if (regFrom >= regTo) {
      return console.log('Warning: regFrom must < regTo.');
    }

    const chainId = await fetchChainId();
  
    const { nameInfo } = this.state;
    const index = nameInfo.findIndex((item) => item.label === label);

    let regMsges = [
      {
        time: moment(),
        type: 'action',
        text: 'regStarted',
      },
    ];
    this.setState({ regMsges });

    duration =
      duration ??
      moment.duration(conf.custom.register.duration, 'years').asSeconds();
    duration = Math.max(duration, 2419200); // 2419200 seconds = 28 days

    let regInfo = {
      receiver: undefined, // receiver can be address or ENS name
      owner: undefined, // owner can only be a standard ETH address
      duration: duration,
      secret: undefined,
      resolver: '0x0000000000000000000000000000000000000000',
      addr: '0x0000000000000000000000000000000000000000',
      commitment: undefined,
    };

    // prepare of regNew or regFrom*

    const regPrepare = async (regFrom) => {
      if (regFrom <= 0) {
        // Verify that the user entered a valid receiver (ETH address or ENS name)
        try {
          const owner = await publicClient.getEnsAddress({ name: normalize(receiver)});
          if (!owner) {
            throw new Error('This ENS does not have an address configured.');
          }

          regInfo.receiver = receiver;
          regInfo.owner = owner;
        } catch (e) {
          console.log(e);
          regMsges[0] = {
            time: moment(),
            type: 'action',
            text: 'regBefore',
          };
          regMsges.push({
            time: moment(),
            type: 'failed',
            text: t('modal.reg.wrongReceiver'),
          });
          this.setState({ regMsges });
          return 0;
        }

        regInfo.secret = generatePrivateKey();

        if (conf.custom.register.registerWithConfig) {
          regInfo.resolver = addrs[chainId].PubRes;
          regInfo.addr = regInfo.owner;
        }

        regMsges.push({
          time: moment(),
          type: 'info',
          text: t('modal.reg.register00', {
            label: label,
            owner: regInfo.owner.substr(0, 7) + '...',
            duration: moment.duration(duration, 'seconds').asYears().toFixed(2),
          }),
        });
        this.setState({ regMsges });

        // makeCommitmentWithConfig
        const makeCommitArgs = {
          name: label,
          owner: regInfo.owner,
          secret: regInfo.secret,
          resolver: regInfo.resolver,
          addr: regInfo.addr
        }
        regInfo.commitment = await readCon('ETHRegCtrl', chainId, 'makeCommitmentWithConfig', makeCommitArgs);

        // init regInfo
        storeRegInfo(label, regInfo);
        return regFrom;
      } else {
        regInfo = { ...getRegInfo(label), duration: duration }; // support inputing a new duration
        storeRegInfo(label, regInfo);

        regMsges.push({
          time: moment(),
          type: 'info',
          text: t('modal.reg.register00', {
            label: label,
            owner: regInfo.owner.substr(0, 7) + '...',
            duration: moment
              .duration(regInfo.duration, 'seconds')
              .asYears()
              .toFixed(2),
          }),
        });
        this.setState({ regMsges });

        return await updateRegStep(label, regFrom);
      }
    };

    // *** regStep 0 -> 0.5

    const regFrom0 = async () => {
      // double check if each name is registrable now
      if (!this.isRegistrableNow(label, nameInfo)) {
        nameInfo[index].regStep = 0;
        this.setAndStoreNameInfo(nameInfo, false);

        regMsges.push({
          time: moment(),
          type: 'info',
          text: t('modal.reg.unregistrableNow', { label: label }),
        });
        regMsges[0] = {
          time: moment(),
          type: 'action',
          text: 'regFailed',
        };
        this.setState({ regMsges });
        return nameInfo[index].regStep;
      }

      // let commitOverrides = {}; // config overrides
      // commitOverrides.gasLimit = 70000;

      try {
        // submit the 1st transaction
        const commitTx = await writeCon('ETHRegCtrl', chainId, 'commit', { commitment: regInfo.commitment });
        regInfo.commitTxHash = commitTx.hash;
      } catch (e) {
        console.log(e);
        nameInfo[index].regStep = 0;
        this.setState({ nameInfo });
        regMsges[0] = {
          time: moment(),
          type: 'action',
          text: 'regSuspended',
        };
        this.setState({ regMsges });
        return nameInfo[index].regStep;
      }

      //regInfo = { ...regInfo, commitTxHash: tx10.hash }
      storeRegInfo(label, regInfo);

      nameInfo[index].regStep = 0.5;
      this.setAndStoreNameInfo(nameInfo, false);

      if (regTo <= 0.5) {
        return nameInfo[index].regStep;
      }
      return await regFrom05();
    };

    // *** regStep 0.5 -> 1 / 0

    const regFrom05 = async () => {
      const commitTxLink =
        '<a href="' +
        confFixed.scanConf[chainId] +
        'tx/' +
        regInfo.commitTxHash +
        '" target="_blank" rel="noreferrer">' +
        t('c.tx') +
        '</a>';

      regMsges.push({
        time: moment(),
        type: 'info',
        text: t('modal.reg.register10', { label: label, txLink: commitTxLink }),
      });
      this.setState({ regMsges });

      const commitTxReceipt = await publicClient.waitForTransactionReceipt({
        confirmations: 2,
        hash: regInfo.commitTxHash
      });

      if (commitTxReceipt.status === 'success') {
        nameInfo[index].regStep = 1;
        this.setAndStoreNameInfo(nameInfo, false);

        regMsges.push({
          time: moment(),
          type: 'info',
          text: t('modal.reg.register11.succeed', {
            label: label,
            txLink: commitTxLink,
          }),
        });
        this.setState({ regMsges });
      } else {
        // if step 1 failed, cancel the process.
        nameInfo[index].regStep = 0;
        this.setAndStoreNameInfo(nameInfo, false);

        regMsges[0] = {
          time: moment(),
          type: 'action',
          text: 'regFailed',
        };
        regMsges.push({
          time: moment(),
          type: 'failed',
          text: t('modal.reg.register11.fail', {
            label: label,
            txLink: commitTxLink,
          }),
        });
        this.setState({ regMsges });
        return nameInfo[index].regStep;
      }

      if (regTo <= 1) {
        return nameInfo[index].regStep;
      }
      return await regFrom1();
    };

    // *** regStep 1 -> 2

    const regFrom1 = async () => {
      // long-timeout is necessary for durations >24.8 days
      const wait = (ms) => new Promise((resolve) => lt.setTimeout(resolve, ms));
      await wait(confFixed.ensConf.minCommitmentAge * 1000);

      nameInfo[index].regStep = 2;
      this.setAndStoreNameInfo(nameInfo, false);

      if (regTo <= 2) {
        return nameInfo[index].regStep;
      }
      return await regFrom2();
    };

    // *** regStep 2 -> 2.5

    const regFrom2 = async () => {
      regMsges.push({
        time: moment(),
        type: 'info',
        text: t('modal.reg.register20', { label: label }),
      });
      this.setState({ regMsges });

      // double check if each name is registrable now
      if (!this.isRegistrableNow(label, nameInfo)) {
        nameInfo[index].regStep = 0;
        this.setAndStoreNameInfo(nameInfo, false);

        regMsges.push({
          time: moment(),
          type: 'info',
          text: t('modal.reg.unregistrableNow', { label: label }),
        });
        regMsges[0] = {
          time: moment(),
          type: 'action',
          text: 'regFailed',
        };
        this.setState({ regMsges });
        return nameInfo[index].regStep;
      }

      // let regOverrides = {};
      // regOverrides.gasLimit = conf.custom.register.registerWithConfig
      //   ? 300000
      //   : 220000;
      // regOverrides.value = (await ETHRegCtrl.rentPrice(label, duration))
      //   .mul(105)
      //   .div(100);

      try {
        const registerWithConfigArgs = {
          name: label,
          owner: regInfo.owner,
          duration: regInfo.duration,
          secret: regInfo.secret,
          resolver: regInfo.resolver,
          addr: regInfo.addr,
        }
        // submit the 2nd transaction
        const regTx = await writeCon('ETHRegCtrl', chainId, 'registerWithConfig', registerWithConfigArgs);
        regInfo.regTxHash = regTx.hash;
      } catch (e) {
        console.log(e);
        nameInfo[index].regStep = 2;
        this.setState({ nameInfo });
        regMsges[0] = {
          time: moment(),
          type: 'action',
          text: 'regSuspended',
        };
        this.setState({ regMsges });
        return nameInfo[index].regStep;
      }

      //regInfo = { ...regInfo, regTxHash: tx30.hash }
      storeRegInfo(label, regInfo);
      nameInfo[index].regStep = 2.5;
      this.setAndStoreNameInfo(nameInfo, false);

      if (regTo <= 2.5) {
        return nameInfo[index].regStep;
      }
      return await regFrom25();
    };

    // *** regStep 2.5 -> 3 / 2

    const regFrom25 = async () => {
      const regTxLink =
        '<a href="' +
        confFixed.scanConf[chainId] +
        'tx/' +
        regInfo.regTxHash +
        '" target="_blank" rel="noreferrer">' +
        t('c.tx') +
        '</a>';

      regMsges.push({
        time: moment(),
        type: 'info',
        text: t('modal.reg.register30', { label: label, regTxLink: regTxLink }),
      });
      this.setState({ regMsges });

      const regTxReceipt = await publicClient.waitForTransactionReceipt({
        confirmations: 2,
        hash: regInfo.regTxHash
      });
      // insert regInfo: regTx
      if (regTxReceipt.status) {
        nameInfo[index].regStep = 3;
        this.setAndStoreNameInfo(nameInfo, false);

        regMsges.push({
          time: moment(),
          type: 'info',
          text: t('modal.reg.register31.succeed', {
            label: label,
            regTxLink: regTxLink,
          }),
        });
        regMsges[0] = {
          time: moment(),
          type: 'action',
          text: 'regSucceeded',
        };
        this.setState({ regMsges });
        return nameInfo[index].regStep;
      } else {
        nameInfo[index].regStep = 2;
        this.setAndStoreNameInfo(nameInfo, false);

        regMsges.push({
          time: moment(),
          type: 'info',
          text: t('modal.reg.register31.fail', {
            label: label,
            regTxLink: regTxLink,
          }),
        });
        regMsges[0] = {
          time: moment(),
          type: 'action',
          text: 'regFailed',
        };
        this.setState({ regMsges });
        return nameInfo[index].regStep;
      }
      // regMsges = INITIAL_STATE.regMsges will be executed in registerNameEnd()
    };

    const updatedRegFrom = await regPrepare(regFrom);

    if (updatedRegFrom < 0) return 0; // execute this line if prepare failed
    if (updatedRegFrom === 2.5) return await regFrom25();
    if (updatedRegFrom === 2) return await regFrom2();
    if (updatedRegFrom === 1) return await regFrom1();
    if (updatedRegFrom === 0.5) return await regFrom05();
    return await regFrom0();
  };

  registerNameEnd = async (label) => {
    this.setState({ regMsges: INITIAL_STATE.regMsges });
    await this.updateNames([label]);
  };

  renewName = async (label, duration) => {
    const chainId = await fetchChainId();

    duration =
      duration ??
      moment.duration(conf.custom.renew.duration, 'years').asSeconds();

    let renewMsges = [
      {
        time: moment(),
        type: 'action',
        text: 'renewStarted',
      },
    ];
    renewMsges.push({
      time: moment(),
      type: 'info',
      text: t('modal.renew.renew00', {
        label: label,
        duration: moment.duration(duration, 'seconds').asYears().toFixed(2),
      }),
    });
    this.setState({ renewMsges });

    let renewTx;
    let renewTxLink;
    // let renewOverrides = {};
    // renewOverrides.gasLimit = 120000; // !!!!!
    // renewOverrides.value = (await ETHRegCtrl.rentPrice(label, duration))
    //   .mul(105)
    //   .div(100);

    try {
      const renewArgs = {
        name: label,
        duration
      }
      // submit the 2nd transaction
      renewTx = await writeCon('ETHRegCtrl', chainId, 'renew', renewArgs);
      renewTxLink =
        '<a href="' +
        confFixed.scanConf[chainId] +
        'tx/' +
        renewTx.hash +
        '" target="_blank" rel="noreferrer">' +
        t('c.tx') +
        '</a>';

      renewMsges.push({
        time: moment(),
        type: 'info',
        text: t('modal.renew.renew10', { label: label, txLink: renewTxLink }),
      });
      this.setState({ renewMsges });
    } catch (e) {
      console.log(e);
      renewMsges[0] = {
        time: moment(),
        type: 'action',
        text: 'renewSuspended',
      };
      this.setState({ renewMsges });
      return;
    }

    const renewTxReceipt = await publicClient.waitForTransactionReceipt({
      confirmations: 1,
      hash: renewTx.hash
    });

    if (renewTxReceipt.status) {
      renewMsges.push({
        time: moment(),
        type: 'info',
        text: t('modal.renew.renew11.succeed', {
          label: label,
          txLink: renewTxLink,
        }),
      });
      renewMsges[0] = {
        time: moment(),
        type: 'action',
        text: 'renewSucceeded',
      };
      this.setState({ renewMsges });
    } else {
      renewMsges.push({
        time: moment(),
        type: 'info',
        text: t('modal.renew.renew11.fail', {
          label: label,
          txLink: renewTxLink,
        }),
      });
      renewMsges[0] = {
        time: moment(),
        type: 'action',
        text: 'renewFailed',
      };
      this.setState({ renewMsges });
    }
  };

  renewNameEnd = async (label) => {
    this.setState({ renewMsges: INITIAL_STATE.renewMsges });
    await this.updateNames([label]);
  };

  renewNames = async (renewList, duration) => {
    duration =
      duration ??
      moment.duration(conf.custom.renew.duration, 'years').asSeconds();

    let renewsMsges = [
      {
        time: moment(),
        type: 'action',
        text: 'renewsStarted',
      },
    ];
    renewsMsges.push({
      time: moment(),
      type: 'info',
      text: t('modal.renews.renews00', {
        duration: moment.duration(duration, 'seconds').asYears().toFixed(2),
      }),
    });
    this.setState({ renewsMsges });

    let renewsTx;
    let renewsTxLink;

    const chainId = await fetchChainId()
    // const rentPriceArgs = {
    //   names: renewList,
    //   duration
    // }

    // make sure the funding can cover the consumption
    // let renewsOverrides = {};
    // renewsOverrides.value = (await readCon('BulkRenewCon', chainId, 'rentPrice', rentPriceArgs)).mul(105).div(100);

    const renewAllArgs = {
      names: renewList,
      duration
    }

    try {
      renewsTx = await writeCon('BulkRenew', chainId, 'renewAll', renewAllArgs);
      renewsTxLink =
        '<a href="' +
        confFixed.scanConf[chainId] +
        'tx/' +
        renewsTx.hash +
        '" target="_blank" rel="noreferrer">' +
        t('c.tx') +
        '</a>';

      renewsMsges.push({
        time: moment(),
        type: 'info',
        text: t('modal.renews.renews10', { txLink: renewsTxLink }),
      });
      this.setState({ renewsMsges });
    } catch (e) {
      console.log(e);
      renewsMsges[0] = {
        time: moment(),
        type: 'action',
        text: 'renewsSuspended',
      };
      this.setState({ renewsMsges });
      return;
    }

    const renewsTxReceipt = await publicClient.waitForTransactionReceipt({
      confirmations: 1,
      hash: renewsTx.hash
    });

    if (renewsTxReceipt.status) {
      renewsMsges.push({
        time: moment(),
        type: 'info',
        text: t('modal.renews.renews11.succeed', { txLink: renewsTxLink }),
      });
      renewsMsges[0] = {
        time: moment(),
        type: 'action',
        text: 'renewsSucceeded',
      };
      this.setState({ renewsMsges });
    } else {
      renewsMsges.push({
        time: moment(),
        type: 'info',
        text: t('modal.renews.renews11.fail', { txLink: renewsTxLink }),
      });
      renewsMsges[0] = {
        time: moment(),
        type: 'action',
        text: 'renewsFailed',
      };
      this.setState({ renewsMsges });
    }
  };

  renewNamesEnd = async (renewList) => {
    this.setState({ renewsMsges: INITIAL_STATE.renewsMsges });
    await this.updateNames(renewList);
  };

  estimateCost = async (label, duration) => {
    const chainId = await fetchChainId()

    duration =
      duration ??
      moment.duration(conf.custom.register.duration, 'years').asSeconds();
    duration = Math.max(duration, 2419200); // 2419200 seconds = 28 days

    const rentPriceArgs = [label, duration]
    const rent = await readCon('ETHRegCtrl', chainId, 'rentPrice', rentPriceArgs);

    const gasPrice =
      conf.custom.register.gasPrice > 0
        ? parseUnits(conf.custom.register.gasPrice.toString(), 9)
        : await publicClient.getGasPrice();
    const gasFee = gasPrice * BigInt(50000 + 270000); // commitGasLimit + regGasLimit
    const costWei = gasFee + BigInt(rent);

    return costWei;
  };

  subscribeProvider = async (publicClient) => {   // need to deal
    if (!publicClient.on) {
      return;
    }
    publicClient.on('accountsChanged', async (accounts) => {
      // if (this.state.type !== 'web3') {
      //   return console.log('Your switch only works in Web3 mode.');
      // }
      // this.reconnectApp(false);
    });
    publicClient.on('chainChanged', async (chainId) => {
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

  render() {
    const {
      reconnecting,
      fetching,
      unsupported,
      nameInfo,
      regMsges,
      renewMsges,
      renewsMsges,
      ethPrice,
      walletAddress,
      chainId
    } = this.state;

    document.title = conf.custom.pageTag
      ? `${conf.custom.pageTag} - ${conf.projectName}`
      : conf.projectName;

    return (
      <div id="main-wrapper" className="container main-wrapper">
        <Header
          conf={conf}
          confFixed={confFixed}
          reconnectApp={this.reconnectApp}
          disconnectApp={this.disconnectApp}
          reconnecting={reconnecting}
          setAndStoreConfInfo={this.setAndStoreConfInfo}
        />
        <MainForm
          nameInfo={nameInfo}
          setAndStoreNameInfo={this.setAndStoreNameInfo}
          updateNames={this.updateNames}
        />
        <MainTable
          conf={conf}
          nameInfo={nameInfo}
          reconnectApp={this.reconnectApp}
          ethPrice={ethPrice}
          walletAddress={walletAddress}
          chainId={chainId}
          reconnecting={reconnecting}
          fetching={fetching}
          updateNames={this.updateNames}
          registerName={this.registerName}
          registerNameEnd={this.registerNameEnd}
          renewName={this.renewName}
          renewNameEnd={this.renewNameEnd}
          renewNames={this.renewNames}
          renewNamesEnd={this.renewNamesEnd}
          estimateCost={this.estimateCost}
          regMsges={regMsges}
          renewMsges={renewMsges}
          renewsMsges={renewsMsges}
          getDefaultNameReceiver={this.getDefaultNameReceiver}
          setAndStoreNameInfo={this.setAndStoreNameInfo}
        />
        <Footer />
        <TestBar />
        <MessageToasts
          onRef={(ref) => {
            this.MessageToasts = ref;
          }}
        />
        <UnsupportedNetworkModal
          show={unsupported}
          disconnectApp={this.disconnectApp}
        />
      </div>
    );
  }
}

export default ENSBook;
