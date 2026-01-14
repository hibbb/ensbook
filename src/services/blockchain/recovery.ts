// src/services/blockchain/recovery.ts

import { type PublicClient } from "viem";
import { type RegistrationStatus } from "../../types/ensRegistration";
import { getRegistrationState } from "../storage/registration";
import { checkTxStatus } from "./transaction";

const MIN_COMMITMENT_AGE = 60;
const MAX_COMMITMENT_AGE = 86400;

export interface RegStatusResult {
  status: RegistrationStatus;
  secondsLeft: number;
  localState: ReturnType<typeof getRegistrationState>;
  errorMessage?: string;
}

export async function checkRegStatus(
  publicClient: PublicClient,
  label: string,
): Promise<RegStatusResult> {
  const localState = getRegistrationState(label);

  if (!localState) {
    return { status: "idle", secondsLeft: 0, localState: null };
  }

  const { commitTxHash, regTxHash } = localState;
  let regErrorMessage: string | undefined;

  // A. 检查注册交易
  if (regTxHash) {
    const txStatus = await checkTxStatus(publicClient, regTxHash);

    if (txStatus.state === "confirmed") {
      return { status: "success", secondsLeft: 0, localState };
    }
    if (txStatus.state === "pending" || txStatus.state === "not_found") {
      return { status: "waiting_register", secondsLeft: 0, localState };
    }
    if (txStatus.state === "reverted") {
      regErrorMessage = "transaction.result.error_desc";
    }
  }

  // B. 检查 Commit 交易
  if (commitTxHash) {
    const txStatus = await checkTxStatus(publicClient, commitTxHash);

    if (txStatus.state === "reverted") {
      return {
        status: "error",
        secondsLeft: 0,
        localState,
        errorMessage: "transaction.step.commit_failed",
      };
    }
    if (txStatus.state === "pending" || txStatus.state === "not_found") {
      return { status: "waiting_commit", secondsLeft: 0, localState };
    }
    if (txStatus.state === "confirmed" && txStatus.timestamp) {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - txStatus.timestamp;

      if (elapsed > MAX_COMMITMENT_AGE) {
        return {
          status: "idle",
          secondsLeft: 0,
          localState,
          errorMessage: "transaction.toast.commit_expired",
        };
      }

      const waitThreshold = MIN_COMMITMENT_AGE + 5;
      if (elapsed < waitThreshold) {
        const remaining = waitThreshold - elapsed;
        return {
          status: "counting_down",
          secondsLeft: remaining > 0 ? remaining : 0,
          localState,
        };
      }

      return {
        status: "registering",
        secondsLeft: 0,
        localState,
        errorMessage: regErrorMessage,
      };
    }
  }

  return { status: "idle", secondsLeft: 0, localState };
}
