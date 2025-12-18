// src/utils/checkRegStatus.ts

import { type PublicClient } from "viem";
import { type RegistrationStatus } from "../types/ensRegistration";
import { getRegistrationState } from "./storage";
import { checkTxStatus } from "./checkTxStatus";

// 常量定义
const MIN_COMMITMENT_AGE = 60; // 最小等待时间 (秒)
const MAX_COMMITMENT_AGE = 86400; // 最大有效期 (24小时)

export interface ResumeResult {
  status: RegistrationStatus;
  secondsLeft: number; // 仅在 counting_down 状态有效
  localState: ReturnType<typeof getRegistrationState>;
  errorMessage?: string;
}

/**
 * 核心逻辑：根据本地存储和链上状态，推导当前的注册进度
 */
export async function checkRegStatus(
  publicClient: PublicClient,
  label: string,
): Promise<ResumeResult> {
  const localState = getRegistrationState(label);

  if (!localState) {
    return { status: "idle", secondsLeft: 0, localState: null };
  }

  const { commitTxHash, regTxHash } = localState;
  let regErrorMessage: string | undefined;

  // -----------------------------------------------------------
  // 阶段 A: 检查最终注册交易 (Register)
  // -----------------------------------------------------------
  if (regTxHash) {
    const txStatus = await checkTxStatus(publicClient, regTxHash);

    // 1. 如果注册成功，流程结束
    if (txStatus.state === "confirmed") {
      return { status: "success", secondsLeft: 0, localState };
    }

    // 2. 如果等待中，直接返回等待状态
    if (txStatus.state === "pending" || txStatus.state === "not_found") {
      return { status: "waiting_register", secondsLeft: 0, localState };
    }

    // 3. 如果失败 (Reverted)
    // ⚡️ 关键优化：不要直接返回，而是记录错误信息，
    // 然后让代码继续向下执行，去检查 Commit 是否还在有效期内。
    if (txStatus.state === "reverted") {
      regErrorMessage = "上一次注册交易失败，请重试";
    }
  }

  // -----------------------------------------------------------
  // 阶段 B: 检查 Commit 交易 (及其时效性)
  // -----------------------------------------------------------
  if (commitTxHash) {
    const txStatus = await checkTxStatus(publicClient, commitTxHash);

    if (txStatus.state === "reverted") {
      return {
        status: "error",
        secondsLeft: 0,
        localState,
        errorMessage: "Commit 交易失败，请重新开始",
      };
    }

    if (txStatus.state === "pending" || txStatus.state === "not_found") {
      return { status: "waiting_commit", secondsLeft: 0, localState };
    }

    // --- Commit 已确认，计算时间差 ---
    if (txStatus.state === "confirmed" && txStatus.timestamp) {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - txStatus.timestamp;

      // 情况 1: 已过期
      if (elapsed > MAX_COMMITMENT_AGE) {
        return {
          status: "idle", // 强制重置
          secondsLeft: 0,
          localState,
          errorMessage: "Commit 已过期，请重新注册",
        };
      }

      // 情况 2: 仍在倒计时缓冲期
      const waitThreshold = MIN_COMMITMENT_AGE + 5;
      if (elapsed < waitThreshold) {
        const remaining = waitThreshold - elapsed;
        return {
          status: "counting_down",
          secondsLeft: remaining > 0 ? remaining : 0,
          localState,
        };
      }

      // 情况 3: 倒计时已结束，可以进行注册
      // 如果之前有 regErrorMessage (说明上次注册失败了)，带上它
      return {
        status: "registering",
        secondsLeft: 0,
        localState,
        errorMessage: regErrorMessage,
      };
    }
  }

  // -----------------------------------------------------------
  // 阶段 C: 兜底
  // -----------------------------------------------------------
  return { status: "idle", secondsLeft: 0, localState };
}
