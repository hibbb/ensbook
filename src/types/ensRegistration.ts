// src/types/ensRegistration.ts

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
  data: readonly Hex[];
  reverseRecord: number;
  referrer: Hex;
}

/**
 * 注册流程的状态机定义
 */
export type RegistrationStatus =
  | "idle"
  | "loading"
  | "committing"
  | "waiting_commit"
  | "counting_down"
  | "ready" // 冷却结束，等待用户点击注册
  | "registering" // 用户已点击，正在请求钱包签名
  | "waiting_register"
  | "success"
  | "error";

/**
 * 保存在本地存储中的完整注册状态
 */
export interface RegistrationState {
  // 核心注册参数
  registration: RegistrationStruct;

  // 流程中间状态
  commitment?: Hex;
  commitTxHash?: Hex;
  regTxHash?: Hex;

  // 元数据
  timestamp: number;
}
