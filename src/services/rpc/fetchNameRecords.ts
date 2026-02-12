// src/services/rpc/fetchNameRecords.ts

import { labelhash, namehash, normalize } from "viem/ens";
import { type Address } from "viem";
import { publicClient } from "../../utils/client";
import { MAINNET_CONTRACTS } from "../../config/contracts";
import { GRACE_PERIOD_DURATION } from "../../config/constants";
import { getFullUserData } from "../storage/userStore";
import type { NameRecord } from "../../types/ensNames";

import {
  ethRegistrarAbi,
  ensRegistryAbi,
  ensNameWrapperAbi,
} from "../../wagmi-generated";
import { deriveNameStatus } from "../../utils/ens";

export async function fetchNameRecordsRPC(
  labels: string[],
): Promise<NameRecord[]> {
  if (!labels || labels.length === 0) return [];

  const userData = getFullUserData();
  const metadata = userData.metadata;
  const validLabels = labels.filter((l) => l && l.trim().length > 0);

  if (validLabels.length === 0) return [];

  // 构建 Multicall 请求
  const contracts = [];

  for (const label of validLabels) {
    let normalized = label;
    try {
      normalized = normalize(label);
    } catch {
      continue;
    }

    const node = namehash(`${normalized}.eth`);
    const labelHash = labelhash(normalized);
    const labelHashId = BigInt(labelHash);
    const nodeInt = BigInt(node);

    // 1. Expiry (BaseRegistrar)
    contracts.push({
      address: MAINNET_CONTRACTS.ETH_REGISTRAR,
      abi: ethRegistrarAbi,
      functionName: "nameExpires",
      args: [labelHashId],
    });

    // 2. Registry Owner (ENS Registry)
    contracts.push({
      address: MAINNET_CONTRACTS.ENS_REGISTRY,
      abi: ensRegistryAbi,
      functionName: "owner",
      args: [node],
    });

    // 3. Wrapper Owner (NameWrapper)
    contracts.push({
      address: MAINNET_CONTRACTS.ENS_NAME_WRAPPER,
      abi: ensNameWrapperAbi,
      functionName: "ownerOf",
      args: [nodeInt],
    });
  }

  // 执行请求
  const results = await publicClient.multicall({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: contracts as any, // 类型断言避免复杂的 viem 类型推导问题
    allowFailure: true,
  });

  const records: NameRecord[] = [];
  const CALLS_PER_ITEM = 3;

  for (let i = 0; i < validLabels.length; i++) {
    const label = validLabels[i];
    const baseIndex = i * CALLS_PER_ITEM;

    const expiryResult = results[baseIndex];
    const ownerResult = results[baseIndex + 1];
    const wrapperOwnerResult = results[baseIndex + 2];

    // 本地元数据
    const meta = metadata[label];
    const memo = meta?.memo || "";
    const level = meta?.level || 0;

    // 基础计算
    let normalized = label;
    try {
      normalized = normalize(label);
    } catch {
      /* ignore */
    }
    const nameHash = namehash(`${normalized}.eth`);
    const labelHash = labelhash(normalized);

    // 解析 Expiry
    let expiryTime = 0;
    if (expiryResult.status === "success") {
      expiryTime = Number(expiryResult.result);
    }

    // 解析 Owner
    let owner: string | null = null;
    let isWrapped = false;

    const registryOwner =
      ownerResult.status === "success" ? (ownerResult.result as Address) : null;

    const wrapperOwner =
      wrapperOwnerResult.status === "success"
        ? (wrapperOwnerResult.result as Address)
        : null;

    if (
      registryOwner &&
      registryOwner.toLowerCase() ===
        MAINNET_CONTRACTS.ENS_NAME_WRAPPER.toLowerCase()
    ) {
      isWrapped = true;
      owner = wrapperOwner ? wrapperOwner.toLowerCase() : null;
    } else {
      isWrapped = false;
      owner = registryOwner ? registryOwner.toLowerCase() : null;
    }

    if (owner === "0x0000000000000000000000000000000000000000") {
      owner = null;
    }

    const status = deriveNameStatus(expiryTime);

    records.push({
      label,
      labelhash: labelHash,
      namehash: nameHash,
      length: label.length,
      status,
      wrapped: isWrapped,
      owner,
      registeredTime: 0, // RPC 无法获取
      expiryTime,
      releaseTime: expiryTime + GRACE_PERIOD_DURATION,
      level,
      memo,
      ownerPrimaryName: undefined,
    });
  }

  return records;
}
