import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EnsBulkRenewal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035)
 */
export const ensBulkRenewalAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'names', internalType: 'string[]', type: 'string[]' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'rentPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'names', internalType: 'string[]', type: 'string[]' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'renewAll',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035)
 */
export const ensBulkRenewalAddress = {
  1: '0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035)
 */
export const ensBulkRenewalConfig = {
  address: ensBulkRenewalAddress,
  abi: ensBulkRenewalAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EnsControllerV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const ensControllerV3Abi = [
  {
    type: 'function',
    inputs: [{ name: 'label', internalType: 'string', type: 'string' }],
    name: 'available',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'commitment', internalType: 'bytes32', type: 'bytes32' }],
    name: 'commit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'registration',
        internalType: 'struct IETHRegistrarController.Registration',
        type: 'tuple',
        components: [
          { name: 'label', internalType: 'string', type: 'string' },
          { name: 'owner', internalType: 'address', type: 'address' },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
          { name: 'secret', internalType: 'bytes32', type: 'bytes32' },
          { name: 'resolver', internalType: 'address', type: 'address' },
          { name: 'data', internalType: 'bytes[]', type: 'bytes[]' },
          { name: 'reverseRecord', internalType: 'uint8', type: 'uint8' },
          { name: 'referrer', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    name: 'makeCommitment',
    outputs: [{ name: 'commitment', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'label', internalType: 'string', type: 'string' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
      { name: 'secret', internalType: 'bytes32', type: 'bytes32' },
      { name: 'resolver', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'reverseRecord', internalType: 'uint8', type: 'uint8' },
      { name: 'referrer', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'label', internalType: 'string', type: 'string' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
      { name: 'referrer', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'renew',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'label', internalType: 'string', type: 'string' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'rentPrice',
    outputs: [
      {
        name: 'price',
        internalType: 'struct IPriceOracle.Price',
        type: 'tuple',
        components: [
          { name: 'base', internalType: 'uint256', type: 'uint256' },
          { name: 'premium', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const ensControllerV3Address = {
  1: '0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const ensControllerV3Config = {
  address: ensControllerV3Address,
  abi: ensControllerV3Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EnsRegistrar
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const ensRegistrarAbi = [
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    name: 'nameExpires',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const ensRegistrarAddress = {
  1: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const ensRegistrarConfig = {
  address: ensRegistrarAddress,
  abi: ensRegistrarAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EthUsdPriceFeed
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const ethUsdPriceFeedAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ name: '', internalType: 'int256', type: 'int256' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const ethUsdPriceFeedAddress = {
  1: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const ethUsdPriceFeedConfig = {
  address: ethUsdPriceFeedAddress,
  abi: ethUsdPriceFeedAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ensBulkRenewalAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035)
 */
export const useReadEnsBulkRenewal = /*#__PURE__*/ createUseReadContract({
  abi: ensBulkRenewalAbi,
  address: ensBulkRenewalAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ensBulkRenewalAbi}__ and `functionName` set to `"rentPrice"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035)
 */
export const useReadEnsBulkRenewalRentPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: ensBulkRenewalAbi,
    address: ensBulkRenewalAddress,
    functionName: 'rentPrice',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ensBulkRenewalAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035)
 */
export const useWriteEnsBulkRenewal = /*#__PURE__*/ createUseWriteContract({
  abi: ensBulkRenewalAbi,
  address: ensBulkRenewalAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ensBulkRenewalAbi}__ and `functionName` set to `"renewAll"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035)
 */
export const useWriteEnsBulkRenewalRenewAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: ensBulkRenewalAbi,
    address: ensBulkRenewalAddress,
    functionName: 'renewAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ensBulkRenewalAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035)
 */
export const useSimulateEnsBulkRenewal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ensBulkRenewalAbi,
    address: ensBulkRenewalAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ensBulkRenewalAbi}__ and `functionName` set to `"renewAll"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xfF252725f6122A92551A5FA9a6b6bf10eb0Be035)
 */
export const useSimulateEnsBulkRenewalRenewAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ensBulkRenewalAbi,
    address: ensBulkRenewalAddress,
    functionName: 'renewAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ensControllerV3Abi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useReadEnsControllerV3 = /*#__PURE__*/ createUseReadContract({
  abi: ensControllerV3Abi,
  address: ensControllerV3Address,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ensControllerV3Abi}__ and `functionName` set to `"available"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useReadEnsControllerV3Available =
  /*#__PURE__*/ createUseReadContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
    functionName: 'available',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ensControllerV3Abi}__ and `functionName` set to `"makeCommitment"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useReadEnsControllerV3MakeCommitment =
  /*#__PURE__*/ createUseReadContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
    functionName: 'makeCommitment',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ensControllerV3Abi}__ and `functionName` set to `"rentPrice"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useReadEnsControllerV3RentPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
    functionName: 'rentPrice',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ensControllerV3Abi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useWriteEnsControllerV3 = /*#__PURE__*/ createUseWriteContract({
  abi: ensControllerV3Abi,
  address: ensControllerV3Address,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ensControllerV3Abi}__ and `functionName` set to `"commit"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useWriteEnsControllerV3Commit =
  /*#__PURE__*/ createUseWriteContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
    functionName: 'commit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ensControllerV3Abi}__ and `functionName` set to `"register"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useWriteEnsControllerV3Register =
  /*#__PURE__*/ createUseWriteContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
    functionName: 'register',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ensControllerV3Abi}__ and `functionName` set to `"renew"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useWriteEnsControllerV3Renew =
  /*#__PURE__*/ createUseWriteContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
    functionName: 'renew',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ensControllerV3Abi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useSimulateEnsControllerV3 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ensControllerV3Abi}__ and `functionName` set to `"commit"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useSimulateEnsControllerV3Commit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
    functionName: 'commit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ensControllerV3Abi}__ and `functionName` set to `"register"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useSimulateEnsControllerV3Register =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
    functionName: 'register',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ensControllerV3Abi}__ and `functionName` set to `"renew"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useSimulateEnsControllerV3Renew =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ensControllerV3Abi,
    address: ensControllerV3Address,
    functionName: 'renew',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ensRegistrarAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const useReadEnsRegistrar = /*#__PURE__*/ createUseReadContract({
  abi: ensRegistrarAbi,
  address: ensRegistrarAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ensRegistrarAbi}__ and `functionName` set to `"nameExpires"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const useReadEnsRegistrarNameExpires =
  /*#__PURE__*/ createUseReadContract({
    abi: ensRegistrarAbi,
    address: ensRegistrarAddress,
    functionName: 'nameExpires',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ensRegistrarAbi}__ and `functionName` set to `"ownerOf"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const useReadEnsRegistrarOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: ensRegistrarAbi,
  address: ensRegistrarAddress,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethUsdPriceFeedAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const useReadEthUsdPriceFeed = /*#__PURE__*/ createUseReadContract({
  abi: ethUsdPriceFeedAbi,
  address: ethUsdPriceFeedAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethUsdPriceFeedAbi}__ and `functionName` set to `"latestAnswer"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const useReadEthUsdPriceFeedLatestAnswer =
  /*#__PURE__*/ createUseReadContract({
    abi: ethUsdPriceFeedAbi,
    address: ethUsdPriceFeedAddress,
    functionName: 'latestAnswer',
  })
