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
  data: readonly Hex[]; // 建议加上 readonly 以完美匹配生成的类型
  reverseRecord: number;
  referrer: Hex;
}

/**
 * 注册流程的状态机定义
 */
export type RegistrationStatus =
  | "idle"
  | "committing" // 等待钱包确认 Commit
  | "waiting_commit" // Commit 上链中
  | "counting_down" // 60秒倒计时
  | "registering" // 等待钱包确认 Register
  | "waiting_register" // Register 上链中
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
