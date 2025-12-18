// src/types/ens.ts

import { type Address, type Hex } from "viem";

/**
 * 对应 EthControllerV3 合约的 Registration 结构体
 */
export interface RegistrationStruct {
  label: string;
  owner: Address;
  duration: bigint;
  secret: Hex;
  resolver: Address;
  data: Hex[];
  reverseRecord: boolean;
  referrer: Hex;
}

/**
 * 保存在本地存储中的完整注册状态
 */
export interface RegistrationState {
  // 核心注册参数
  registration: RegistrationStruct;

  // 流程中间状态
  commitment?: Hex; // 计算出的承诺哈希
  commitTxHash?: Hex; // 第一步 Commit 的交易哈希
  regTxHash?: Hex; // 第二步 Register 的交易哈希

  // 元数据
  timestamp: number; // 创建时间，用于判断数据是否过期
}

export interface NameRecord {
  readonly label: string;
  readonly tokenId: string;
  length: number;
  level: number; // 用户标记等级，默认 1
  /**
   * 域名状态：
   * - Active: 正常使用中
   * - GracePeriod: 宽限期（过期 90 天内，原持有人仍可续费）
   * - PremiumPeriod: 溢价期（宽限期后 21 天，价格随时间下降，任何人可抢注）
   * - Released: 已被释放（溢价期结束，等待系统重置或处于可被重新注册的过渡态）
   * - Available: 未注册（当前完全处于空闲状态，可按常规价格注册）
   */
  status: "Active" | "GracePeriod" | "PremiumPeriod" | "Released" | "Available";
  wrapped: boolean;
  owner: string | null; // 使用 null 表示无所有者

  // 时间字段优化：统一使用名词 + Time
  registeredTime: number; // 注册时间 (Unix)
  expiryTime: number; // 到期时间 (Unix)
  releaseTime: number; // 释放/进入溢价期时间 (Unix)
}

export type NameRecords = NameRecord[];
