import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BulkRenewal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0735086b17D590c19907E88B6915ecDf47Fe8D88)
 */
export const bulkRenewalAbi = [
  {
    type: "function",
    inputs: [
      { name: "labels", internalType: "string[]", type: "string[]" },
      { name: "durations", internalType: "uint256[]", type: "uint256[]" },
      { name: "referrer", internalType: "bytes32", type: "bytes32" },
    ],
    name: "renewAll",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "labels", internalType: "string[]", type: "string[]" },
      { name: "durations", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "rentPrice",
    outputs: [{ name: "total", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0735086b17D590c19907E88B6915ecDf47Fe8D88)
 */
export const bulkRenewalAddress = {
  1: "0x0735086b17D590c19907E88B6915ecDf47Fe8D88",
} as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0735086b17D590c19907E88B6915ecDf47Fe8D88)
 */
export const bulkRenewalConfig = {
  address: bulkRenewalAddress,
  abi: bulkRenewalAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EthControllerV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const ethControllerV3Abi = [
  {
    type: "function",
    inputs: [{ name: "label", internalType: "string", type: "string" }],
    name: "available",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "commitment", internalType: "bytes32", type: "bytes32" }],
    name: "commit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "registration",
        internalType: "struct IETHRegistrarController.Registration",
        type: "tuple",
        components: [
          { name: "label", internalType: "string", type: "string" },
          { name: "owner", internalType: "address", type: "address" },
          { name: "duration", internalType: "uint256", type: "uint256" },
          { name: "secret", internalType: "bytes32", type: "bytes32" },
          { name: "resolver", internalType: "address", type: "address" },
          { name: "data", internalType: "bytes[]", type: "bytes[]" },
          { name: "reverseRecord", internalType: "uint8", type: "uint8" },
          { name: "referrer", internalType: "bytes32", type: "bytes32" },
        ],
      },
    ],
    name: "makeCommitment",
    outputs: [{ name: "commitment", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      {
        name: "registration",
        internalType: "struct IETHRegistrarController.Registration",
        type: "tuple",
        components: [
          { name: "label", internalType: "string", type: "string" },
          { name: "owner", internalType: "address", type: "address" },
          { name: "duration", internalType: "uint256", type: "uint256" },
          { name: "secret", internalType: "bytes32", type: "bytes32" },
          { name: "resolver", internalType: "address", type: "address" },
          { name: "data", internalType: "bytes[]", type: "bytes[]" },
          { name: "reverseRecord", internalType: "uint8", type: "uint8" },
          { name: "referrer", internalType: "bytes32", type: "bytes32" },
        ],
      },
    ],
    name: "register",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "label", internalType: "string", type: "string" },
      { name: "duration", internalType: "uint256", type: "uint256" },
      { name: "referrer", internalType: "bytes32", type: "bytes32" },
    ],
    name: "renew",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "label", internalType: "string", type: "string" },
      { name: "duration", internalType: "uint256", type: "uint256" },
    ],
    name: "rentPrice",
    outputs: [
      {
        name: "price",
        internalType: "struct IPriceOracle.Price",
        type: "tuple",
        components: [
          { name: "base", internalType: "uint256", type: "uint256" },
          { name: "premium", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const ethControllerV3Address = {
  1: "0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547",
} as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const ethControllerV3Config = {
  address: ethControllerV3Address,
  abi: ethControllerV3Abi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EthPriceFeed
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const ethPriceFeedAbi = [
  {
    type: "function",
    inputs: [],
    name: "latestAnswer",
    outputs: [{ name: "", internalType: "int256", type: "int256" }],
    stateMutability: "view",
  },
] as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const ethPriceFeedAddress = {
  1: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
} as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const ethPriceFeedConfig = {
  address: ethPriceFeedAddress,
  abi: ethPriceFeedAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EthRegistrar
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const ethRegistrarAbi = [
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [{ name: "id", internalType: "uint256", type: "uint256" }],
    name: "nameExpires",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
] as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const ethRegistrarAddress = {
  1: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
} as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const ethRegistrarConfig = {
  address: ethRegistrarAddress,
  abi: ethRegistrarAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bulkRenewalAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0735086b17D590c19907E88B6915ecDf47Fe8D88)
 */
export const useReadBulkRenewal = /*#__PURE__*/ createUseReadContract({
  abi: bulkRenewalAbi,
  address: bulkRenewalAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bulkRenewalAbi}__ and `functionName` set to `"rentPrice"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0735086b17D590c19907E88B6915ecDf47Fe8D88)
 */
export const useReadBulkRenewalRentPrice = /*#__PURE__*/ createUseReadContract({
  abi: bulkRenewalAbi,
  address: bulkRenewalAddress,
  functionName: "rentPrice",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bulkRenewalAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0735086b17D590c19907E88B6915ecDf47Fe8D88)
 */
export const useWriteBulkRenewal = /*#__PURE__*/ createUseWriteContract({
  abi: bulkRenewalAbi,
  address: bulkRenewalAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bulkRenewalAbi}__ and `functionName` set to `"renewAll"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0735086b17D590c19907E88B6915ecDf47Fe8D88)
 */
export const useWriteBulkRenewalRenewAll = /*#__PURE__*/ createUseWriteContract(
  {
    abi: bulkRenewalAbi,
    address: bulkRenewalAddress,
    functionName: "renewAll",
  },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bulkRenewalAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0735086b17D590c19907E88B6915ecDf47Fe8D88)
 */
export const useSimulateBulkRenewal = /*#__PURE__*/ createUseSimulateContract({
  abi: bulkRenewalAbi,
  address: bulkRenewalAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bulkRenewalAbi}__ and `functionName` set to `"renewAll"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0735086b17D590c19907E88B6915ecDf47Fe8D88)
 */
export const useSimulateBulkRenewalRenewAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bulkRenewalAbi,
    address: bulkRenewalAddress,
    functionName: "renewAll",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethControllerV3Abi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useReadEthControllerV3 = /*#__PURE__*/ createUseReadContract({
  abi: ethControllerV3Abi,
  address: ethControllerV3Address,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethControllerV3Abi}__ and `functionName` set to `"available"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useReadEthControllerV3Available =
  /*#__PURE__*/ createUseReadContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
    functionName: "available",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethControllerV3Abi}__ and `functionName` set to `"makeCommitment"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useReadEthControllerV3MakeCommitment =
  /*#__PURE__*/ createUseReadContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
    functionName: "makeCommitment",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethControllerV3Abi}__ and `functionName` set to `"rentPrice"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useReadEthControllerV3RentPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
    functionName: "rentPrice",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ethControllerV3Abi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useWriteEthControllerV3 = /*#__PURE__*/ createUseWriteContract({
  abi: ethControllerV3Abi,
  address: ethControllerV3Address,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ethControllerV3Abi}__ and `functionName` set to `"commit"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useWriteEthControllerV3Commit =
  /*#__PURE__*/ createUseWriteContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
    functionName: "commit",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ethControllerV3Abi}__ and `functionName` set to `"register"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useWriteEthControllerV3Register =
  /*#__PURE__*/ createUseWriteContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
    functionName: "register",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ethControllerV3Abi}__ and `functionName` set to `"renew"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useWriteEthControllerV3Renew =
  /*#__PURE__*/ createUseWriteContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
    functionName: "renew",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ethControllerV3Abi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useSimulateEthControllerV3 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ethControllerV3Abi}__ and `functionName` set to `"commit"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useSimulateEthControllerV3Commit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
    functionName: "commit",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ethControllerV3Abi}__ and `functionName` set to `"register"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useSimulateEthControllerV3Register =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
    functionName: "register",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ethControllerV3Abi}__ and `functionName` set to `"renew"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547)
 */
export const useSimulateEthControllerV3Renew =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ethControllerV3Abi,
    address: ethControllerV3Address,
    functionName: "renew",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethPriceFeedAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const useReadEthPriceFeed = /*#__PURE__*/ createUseReadContract({
  abi: ethPriceFeedAbi,
  address: ethPriceFeedAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethPriceFeedAbi}__ and `functionName` set to `"latestAnswer"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
 */
export const useReadEthPriceFeedLatestAnswer =
  /*#__PURE__*/ createUseReadContract({
    abi: ethPriceFeedAbi,
    address: ethPriceFeedAddress,
    functionName: "latestAnswer",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethRegistrarAbi}__
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const useReadEthRegistrar = /*#__PURE__*/ createUseReadContract({
  abi: ethRegistrarAbi,
  address: ethRegistrarAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethRegistrarAbi}__ and `functionName` set to `"nameExpires"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const useReadEthRegistrarNameExpires =
  /*#__PURE__*/ createUseReadContract({
    abi: ethRegistrarAbi,
    address: ethRegistrarAddress,
    functionName: "nameExpires",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ethRegistrarAbi}__ and `functionName` set to `"ownerOf"`
 *
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85)
 */
export const useReadEthRegistrarOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: ethRegistrarAbi,
  address: ethRegistrarAddress,
  functionName: "ownerOf",
});
