import confFile from '../../conf.json';
import confFixed from '../../confFixed.json';
import { Contract, utils } from 'ethers';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import moment from 'moment';
import { getAddress, isAddress } from 'ethers/lib/utils';

export function getConf() {
  if (confFile.host === 'remote') {
    let confStored = JSON.parse(window.localStorage.getItem('confInfo'));
    if (!confStored) {
      confStored = confFile;
      window.localStorage.setItem('confInfo', JSON.stringify(confStored));
    }
    return confStored;
  }
  return confFile;
}

export function getConfFixed() {
  return confFixed;
}

export function updateLookupList(_conf) {
  const conf = _conf ?? getConf();
  const oldList = Object.keys(conf.custom.display.lookup);
  const newList = Object.keys(confFile.custom.display.lookup);

  // update lookupList in localStorage
  window.localStorage.setItem('lookupList', JSON.stringify(newList));

  if (oldList.sort().toString() !== newList.sort().toString()) {
    conf.custom.display.lookup = confFile.custom.display.lookup;
    window.localStorage.setItem('confInfo', JSON.stringify(conf));
  }

  // check if there is conf.custom.premium.priceUnit which was added in 2023.01
  if (!conf.custom.premium.priceUnit) {
    conf.custom.premium.priceUnit = 'ETH';
    window.localStorage.setItem('confInfo', JSON.stringify(conf));
  }

  return conf;
}

export function getContract(providerOrSigner, contract, network, _conf) {
  const conf = _conf ?? getConf();
  const contractAddr = confFixed.contract.addr[network][contract];
  const contractAbi = confFixed.contract.abi[contract];
  return new Contract(contractAddr, contractAbi, providerOrSigner);
}

export function getETHRegCtrlCon(providerOrSigner, network, conf) {
  return getContract(providerOrSigner, 'ETHRegCtrl', network, conf);
}

export function getBaseRegImpCon(providerOrSigner, network, conf) {
  return getContract(providerOrSigner, 'BaseRegImp', network, conf);
}

export function getBulkRenewCon(providerOrSigner, network, conf) {
  return getContract(providerOrSigner, 'BulkRenew', network, conf);
}

export function getBulkRegCon(providerOrSigner, network, conf) {
  return getContract(providerOrSigner, 'BulkReg', network, conf);
}

export function getETHPriceFeedCon(providerOrSigner, network, conf) {
  return getContract(providerOrSigner, 'ETHPriceFeed', network, conf);
}

export function isCustomWallet(_conf) {
  const conf = _conf ?? getConf();
  return conf.custom.wallet.switch;
}

export function isSupportedChain(key) {
  if (typeof key === 'string') {
    return (
      ['homestead', 'mainnet', 'sepolia'].findIndex((item) => item === key) > -1
    );
  }
  if (typeof key === 'number') {
    // ChainId: 1 for Mainnet, 3 for Ropsten, 11155111 for Sepolia
    return [1, 11155111].findIndex((item) => item === key) > -1;
  }
}

export function isMainnet(key) {
  if (typeof key === 'string') {
    return key === 'mainnet' || key === 'homestead';
  }
  if (typeof key === 'number') {
    return key === 1; // ChainId: 1 for Mainnet
  }
}

export function isRopsten(key) {
  if (typeof key === 'string') {
    return key === 'ropsten';
  }
  if (typeof key === 'number') {
    return key === 3; // ChainId: 3 for Ropsten
  }
}

export function isSepolia(key) {
  if (typeof key === 'string') {
    return key === 'sepolia';
  }
  if (typeof key === 'number') {
    return key === 11155111; // ChainId: 11155111 for Sepolia
  }
}

export function isStatus(flag) {
  const statuses = ['Open', 'Normal', 'Grace', 'Premium', 'Reopen', 'Unknown'];
  return statuses.findIndex((item) => item === flag) > -1;
}

export function isOpen(status) {
  return status === 'Open';
}

export function isNormal(status) {
  return status === 'Normal';
}

export function isRegistrable(status) {
  return status === 'Open' || status === 'Reopen' || status === 'Premium';
}

export function isRenewable(status) {
  return status === 'Normal' || status === 'Grace';
}

export function isMyName(nameOwner, connectedAccount) {
  const precondition = isAddress(nameOwner) && isAddress(connectedAccount);
  return precondition
    ? getAddress(nameOwner) === getAddress(connectedAccount)
    : false;
}

export function getRegistrableNames(nameInfo) {
  return nameInfo.filter((nameItem) => isRegistrable(nameItem.status));
}

export function getNameItemByLabel(label, nameInfo) {
  return nameInfo.filter((nameItem) => nameItem.label === label)[0]; // return a struct item
}

export function haveRegistrableNames(nameInfo) {
  return nameInfo.findIndex((row) => isRegistrable(row.status)) > -1;
}

export function haveUnregistrableNames(nameInfo) {
  return nameInfo.findIndex((row) => !isRegistrable(row.status)) > -1;
}

export function haveRenewableNames(nameInfo) {
  return nameInfo.findIndex((row) => isRenewable(row.status)) > -1;
}

export function storeRegInfo(label, regInfo) {
  // regInfo: { owner, duration, secret, resolver, addr, commitment, commitTxHash,regTxHash }
  window.localStorage.setItem(`regInfo-${label}`, JSON.stringify(regInfo));
}

export function getRegInfo(label) {
  return JSON.parse(window.localStorage.getItem(`regInfo-${label}`));
}

export async function updateRegStep(label, _regStep, provider) {
  let regStep = _regStep

  if (regStep === 0 || regStep === 3) {
    removeRegInfo(label);
    return 0;
  }

  const regInfo = getRegInfo(label);

  if (!regInfo) {
    return 0;
  }

  let commitTxReceipt;
  let commitTxTime;
  const regWindow = {};

  if (regInfo.commitTxHash) {
    commitTxReceipt = await provider.getTransactionReceipt(
      regInfo.commitTxHash
    );
    if (!commitTxReceipt) {
      return 0;
    }
  } else {
    return regStep;
  }

  if (commitTxReceipt) {
    commitTxTime = (await provider.getBlock(commitTxReceipt.blockNumber))
      .timestamp;
  } else {
    return regStep;
  }

  if (regStep === 0.5) {
    regStep = 1;
  }

  if (regStep > 0.5) {
    regWindow.start = moment.unix(commitTxTime).add(60, 'seconds');
    regWindow.end = moment.unix(commitTxTime).add(7, 'days');
    regStep = moment().isBefore(regWindow.end) ? regStep : 0;
  }

  if (regStep === 1) {
    regStep = moment().isAfter(regWindow.start) ? 2 : regStep;
  }

  if (regStep === 2.5) {
    const regTxReceipt = await provider.getTransactionReceipt(
      regInfo.regTxHash
    );
    if (regTxReceipt) {
      regStep = regTxReceipt.status ? 3 : 0;
    } // if regTxReceipt is null reStep is still 2.5
  }

  return regStep;
}

export function removeRegInfo(label) {
  window.localStorage.removeItem(`regInfo-${label}`);
}

export async function queryData(queryCode, network) {
  const subgraphUri =
    network === 'sepolia'
      ? 'https://api.studio.thegraph.com/query/49574/enssepolia/version/latest'
      : 'https://gateway-arbitrum.network.thegraph.com/api/9380cc86a43a0042d692548c3b0bd9e2/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH';

  const client = new ApolloClient({
    uri: subgraphUri,
    cache: new InMemoryCache(),
  });

  const queryResult = await client.query({
    query: gql(queryCode.str),
    variables: queryCode.vars,
  });

  return queryResult.data;
}

// entering @ in front of an ENS name or an address can be used to query its names
export async function isForAccount(_str, provider, network) {
  let str = _str
  
  const from = str.startsWith('@')
    ? 'fromOwner'
    : str.startsWith('#')
    ? 'fromAddr'
    : false;

  if (from) {
    str = str.replace('@', '').replace('#', '');
  } else {
    return false;
  }

  if (from === 'fromOwner' && str.endsWith('.eth') && str.length > 6) {
    const label = str.slice(0, -4);
    const labelHash = utils.id(label);
    const queryCode = {
      str: `query($labelHash: String!) {
        registration(id: $labelHash) { registrant { id } }
      }`,
      vars: { labelHash: labelHash },
    };

    const { registration } = await queryData(queryCode, network);
    str = registration?.registrant?.id;
  }

  if (from === 'fromAddr' && str.endsWith('.eth') && str.length > 6) {
    str = await provider.resolveName(str);
  }

  if (isAddress(str)) {
    return str.toLowerCase();
  }

  return false;
}

// fetch the registrations (upto *1000) of an account
export async function getNamesOfOwner(owner, network) {
  if (!owner) {
    return [];
  }
  const queryCode = {
    str: "query($owner: ID!) { registrations(first: 1000, where: {registrant: $owner}) { labelName } }",
    vars: { owner: owner },
  };
  const { registrations } = await queryData(queryCode, network);
  const labelsArr = registrations.map((item) => item.labelName); // labels Array
  return labelsArr.filter((item) => item?.trim()); // remove null/undefined...
}

export async function queryNameInfo(labelsGroup, nameInfo, provider, network) {
  if (labelsGroup.length > 100) {
    return nameInfo;
  }
  const namesGroup = labelsGroup.map(label => `${label}.eth`)

  const queryCode = {
    str: `query($labelsGroup: [String!], $namesGroup: [String!]) {
      registrations(where: {labelName_in: $labelsGroup}) {
        labelName, id, expiryDate, registrationDate, registrant { id }
      }
      wrappedDomains(where: {name_in: $namesGroup}) {
        name, owner { id }
      }
    }`,
    vars: { labelsGroup: labelsGroup, namesGroup: namesGroup },
  };

  const { registrations, wrappedDomains } = await queryData(queryCode, network);

  for (let i = 0; i < labelsGroup.length; i++) {
    const ri = registrations.findIndex(
      (item) => item.labelName === labelsGroup[i]
    );
    const ni = nameInfo.findIndex((item) => item.label === labelsGroup[i]);
    const wi = wrappedDomains.findIndex((item) => item.name === `${labelsGroup[i]}.eth`);
    const isWrappedName = wi > -1

    const actualOwner = isWrappedName ? wrappedDomains[wi].owner.id : registrations[ri]?.registrant.id

    nameInfo[ni].wrapped = isWrappedName
    // add 'length' attribute by addNames() in MainForm.js @v2.2.6
    nameInfo[ni].length = labelsGroup[i].length; // keep this line until 2023.12 or v3.x.x

    if (ri < 0) {
      nameInfo[ni].status = 'Open';
      nameInfo[ni].expiresTime = 0;
      nameInfo[ni].releaseTime = 0;
      nameInfo[ni].registrationTime = 0;
      nameInfo[ni].owner = undefined;
    } else {
      const expiresTime = moment.unix(registrations[ri].expiryDate);
      const releaseTime = moment
        .unix(registrations[ri].expiryDate)
        .add(90, 'days');

      nameInfo[ni].registrationTime = Number(
        registrations[ri].registrationDate
      );
      nameInfo[ni].expiresTime = expiresTime.unix();
      nameInfo[ni].releaseTime = releaseTime.unix();

      if (moment().isSameOrBefore(expiresTime)) {
        nameInfo[ni].status = 'Normal';
        nameInfo[ni].owner = actualOwner;
      } else if (moment().isSameOrBefore(releaseTime)) {
        nameInfo[ni].status = 'Grace';
        nameInfo[ni].owner = actualOwner;
      } else if (moment().subtract(21, 'days').isSameOrBefore(releaseTime)) {
        nameInfo[ni].status = 'Premium';
        nameInfo[ni].owner = undefined;
      } else if (moment().subtract(21, 'days').isAfter(releaseTime)) {
        nameInfo[ni].status = 'Reopen';
        nameInfo[ni].owner = undefined;
      } else {
        nameInfo[ni].status = 'Unknown';
        nameInfo[ni].owner = undefined;
      }
    }

    if (nameInfo[ni].regStep > 0) {
      nameInfo[ni].regStep = await updateRegStep(
        nameInfo[ni].label,
        nameInfo[ni].regStep,
        provider
      );
    }
  }

  return nameInfo;
}

export function getPremiumPrice(releaseTime, decimal = 0) {
  const startPrice = 100000000.0;
  const offset = 47.6837158203125;
  const FACTOR = 0.5;

  const relativeDate = moment.now() - releaseTime * 1000;
  const resAsDay = relativeDate / (24 * 60 * 60 * 1000);
  const exactPrice = Math.max(startPrice * FACTOR ** resAsDay - offset, 0); // in USD

  return exactPrice.toFixed(decimal);
}
