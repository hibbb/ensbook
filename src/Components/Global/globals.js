import confFile from '../../conf.json';
import confFixed from '../../confFixed.json';
import { Contract } from 'ethers';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import moment from 'moment';
import { getAddress, isAddress, namehash } from 'ethers/lib/utils';

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

  return conf;
}

export function getContract(providerOrSigner, contract, network, _conf) {
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

// 缓存常用值
const CHAIN_IDS = {
  MAINNET: 1,
  SEPOLIA: 11155111
};

export function isSupportedChain(key) {
  if (typeof key === 'string') {
    return new Set(['homestead', 'mainnet', 'sepolia']).has(key);
  }
  if (typeof key === 'number') {
    return new Set([CHAIN_IDS.MAINNET, CHAIN_IDS.SEPOLIA]).has(key);
  }
  return false;
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

// 将状态相关的常量提取出来
const NAME_STATUSES = {
  OPEN: 'Open',
  NORMAL: 'Normal',
  GRACE: 'Grace',
  PREMIUM: 'Premium',
  REOPEN: 'Reopen',
  UNKNOWN: 'Unknown'
};

export function isStatus(flag) {
  return Object.values(NAME_STATUSES).includes(flag);
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
  try {
    const subgraphUri = network === 'sepolia' 
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
  } catch (error) {
    console.error('GraphQL query failed:', error);
    throw new Error('Failed to fetch data from subgraph');
  }
}

// entering @ in front of an ENS name or an address can be used to query its names
export async function isForAccount(_str, network) {
  let str = _str
  let owner
  let from
  
  if (str.startsWith('@')) {
    from = 'fromOwner';
    str = str.replace('@', '');
  } else if (str.startsWith('#')) {
    from = 'fromAddr';
    str = str.replace('#', '');
  } else {
    return false;
  }

  if (str.endsWith('.eth') && str.length > 6) {
    const domainID = namehash(str)
    const queryCode = {
      str: `query($domainID: ID!) {
        domain(id: $domainID) {
          registrant { id }
          wrappedOwner { id }
          resolver { addr { id } }
        }
      }`,
      vars: { domainID: domainID },
    };

    const { domain } = await queryData(queryCode, network);
    
    if (from === 'fromOwner' && domain?.registrant?.id) {
      const regid = domain.wrappedOwner.id.toLowerCase()
      const nw = confFixed.contract.addr[network].NameWrapper.toLowerCase()
      owner =  regid === nw ? domain?.wrappedOwner?.id : regid
    }
    if (from === 'fromAddr' && domain.resolver?.addr?.id) {
      owner = domain.resolver?.addr?.id;
    }
  }
  
  if (isAddress(owner)) {
    return owner.toLowerCase();
  }

  return false;
}

// fetch the registrations (upto *1000) of an account
export async function getNamesOfOwner(owner, network) {
  if (!owner) {
    return [];
  }

  // namehash("eth")
  const ethDomainID = "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae"

  const queryCode = {
    str: `query($owner: ID!, $ethDomainID: String) {
      registrations (first: 500, where: { registrant: $owner, domain_: { parent: $ethDomainID } }) { labelName }
      wrappedDomains (first: 500, where: { owner: $owner, domain_: { parent: $ethDomainID } }) { name }
    }`,
    vars: { owner: owner, ethDomainID: ethDomainID },
  };
  const { registrations, wrappedDomains } = await queryData(queryCode, network);

  // domains' labels Array
  const domainsLabels = registrations.map((item) => item.labelName);
  // wrappedDomains' labels Array, cut the last 4 charactors '.eth' of name
  const wrappedDomainsLabels = wrappedDomains.map((item) => item.name.slice(0, -4));
  
  const labelsArr = [
    ...domainsLabels.filter((item) => item?.trim()),
    ...wrappedDomainsLabels.filter((item) => item?.trim())
  ]

  return labelsArr
}

export async function queryNameInfo(labelsGroup, nameInfo, provider, network) {
  if (labelsGroup.length > 100) {
    return nameInfo;
  }
  const namesGroup = labelsGroup.map(label => `${label}.eth`)

  const queryCode = {
    str: `query($labelsGroup: [String!], $namesGroup: [String!]) {
      registrations(where: { labelName_in: $labelsGroup }) {
        labelName, id, expiryDate, registrationDate, registrant { id }
      }
      wrappedDomains(where: { name_in: $namesGroup }) {
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
    const isWrappedName = registrations[ri]?.registrant.id.toLowerCase() === confFixed.contract.addr[network].NameWrapper.toLowerCase()

    const actualOwner = isWrappedName ? wrappedDomains[wi].owner.id : registrations[ri]?.registrant.id

    nameInfo[ni].wrapped = isWrappedName

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
