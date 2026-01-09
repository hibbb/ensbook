// src/hooks/useEnsRegistration.ts

import { useState, useCallback, useRef, useEffect } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { type Hex, type Address } from "viem";
import { normalize } from "viem/ens";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  type RegistrationStruct,
  type RegistrationStatus,
} from "../types/ensRegistration";
import {
  saveRegistrationState,
  removeRegistrationState,
} from "../services/storage/registration";
import { checkRegStatus } from "../services/blockchain/recovery";
import { useChainId } from "wagmi";
import {
  useWriteEthControllerV3,
  ethControllerV3Abi,
} from "../wagmi-generated";
import { REFERRER_ADDRESS_HASH } from "../config/env";
import { getContracts } from "../config/contracts";
import { parseLabel, generateSecret } from "../utils/ens";
import { validateLabel } from "../utils/validate";

export function useEnsRegistration() {
  const [status, setStatus] = useState<RegistrationStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentHash, setCurrentHash] = useState<Hex | null>(null);
  const { t } = useTranslation();

  const registrationDataRef = useRef<RegistrationStruct | null>(null);

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteEthControllerV3();
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setSecondsLeft(0);
    setCurrentHash(null);
    registrationDataRef.current = null;
  }, []);

  const executeRegister = useCallback(
    async (params: RegistrationStruct) => {
      if (!publicClient || !address) return;

      setStatus("registering");
      setCurrentHash(null);
      const contractAddress = contracts.ETH_CONTROLLER_V3;

      try {
        const priceData = (await publicClient.readContract({
          address: contractAddress,
          abi: ethControllerV3Abi,
          functionName: "rentPrice",
          args: [params.label, params.duration],
        })) as { base: bigint; premium: bigint };

        const priceWithBuffer =
          ((priceData.base + priceData.premium) * 110n) / 100n;

        const registerHash = await writeContractAsync({
          functionName: "register",
          args: [params],
          value: priceWithBuffer,
        });

        setCurrentHash(registerHash);
        saveRegistrationState(params.label, { regTxHash: registerHash });

        setStatus("waiting_register");
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: registerHash }),
          {
            // 🚀 替换: hooks.registration.register_confirming -> transaction.toast.confirming
            loading: t("transaction.toast.confirming"),
            // 🚀 替换: hooks.registration.register_success -> transaction.result.success_register
            success: t("transaction.result.success_register"),
            // 🚀 替换: hooks.registration.register_failed -> transaction.toast.failed
            error: t("transaction.toast.failed"),
          },
        );

        removeRegistrationState(params.label);
        setStatus("success");
      } catch (err: unknown) {
        console.error("Register Error:", err);
        if (isMounted.current) {
          setStatus("error");
          const error = err as Error & { shortMessage?: string };

          if (error.shortMessage?.includes("User rejected")) {
            // 🚀 替换: hooks.registration.register_rejected -> transaction.toast.register_rejected
            toast.error(t("transaction.toast.register_rejected"));
          } else {
            toast.error(
              t("transaction.result.error_title") +
                ": " +
                (error.shortMessage || error.message),
            );
          }
        }
      }
    },
    [address, publicClient, writeContractAsync, contracts, t],
  );

  const checkAndResume = useCallback(
    async (rawLabel: string) => {
      if (!publicClient) return;
      const label = normalize(rawLabel).replace(/\.eth$/, "");

      try {
        const result = await checkRegStatus(publicClient, label);

        if (result.status === "idle") {
          console.log("Commit 无效或已过期，清理本地状态");
          removeRegistrationState(label);

          if (result.errorMessage) {
            // checkRegStatus 返回的是 Key，直接翻译
            toast.error(t(result.errorMessage));
          }
          setStatus("idle");
          return;
        }

        if (result.localState && result.localState.registration) {
          console.log("🔍 恢复状态:", result.status);

          registrationDataRef.current = result.localState.registration;

          if (result.status === "waiting_commit") {
            setCurrentHash(result.localState.commitTxHash as Hex);
          } else if (result.status === "waiting_register") {
            setCurrentHash(result.localState.regTxHash as Hex);
          } else {
            setCurrentHash(null);
          }

          setStatus(result.status);
          if (result.errorMessage) {
            toast.error(t(result.errorMessage));
          }

          if (result.status === "counting_down") {
            setSecondsLeft(result.secondsLeft);
            startCountdown(result.secondsLeft, () => {
              if (registrationDataRef.current && isMounted.current) {
                executeRegister(registrationDataRef.current);
              }
            });
          } else if (result.status === "registering") {
            console.log("⚡️ 自动发起最终注册交易...");
            executeRegister(registrationDataRef.current);
          }
        }
      } catch (e) {
        console.error("恢复检查失败", e);
        // 🚀 替换: hooks.registration.recovery_failed -> transaction.toast.recovery_failed
        toast.error(t("transaction.toast.recovery_failed"));
      }
    },
    [publicClient, executeRegister, t],
  );

  const continueRegistration = useCallback(() => {
    if (registrationDataRef.current) {
      executeRegister(registrationDataRef.current);
    } else {
      // 🚀 替换: hooks.registration.recovery_error -> transaction.toast.recovery_failed
      toast.error(t("transaction.toast.recovery_failed"));
      resetStatus();
    }
  }, [executeRegister, resetStatus, t]);

  const startRegistration = useCallback(
    async (rawLabel: string, duration: bigint) => {
      if (!address || !publicClient) {
        // 🚀 替换: hooks.registration.connect_wallet -> common.connect_wallet
        toast.error(t("common.connect_wallet"));
        return;
      }

      let label: string;
      try {
        label = parseLabel(rawLabel);
        validateLabel(label);
      } catch (e: unknown) {
        setStatus("error");
        toast.error((e as Error).message);
        return;
      }

      setStatus("committing");
      setCurrentHash(null);
      const secret = generateSecret();
      const referrer = REFERRER_ADDRESS_HASH;

      const params: RegistrationStruct = {
        label,
        owner: address as Address,
        duration,
        secret,
        resolver: contracts.ENS_PUBLIC_RESOLVER,
        data: [],
        reverseRecord: 0,
        referrer,
      };

      registrationDataRef.current = params;
      saveRegistrationState(label, { registration: params });

      const contractAddress = contracts.ETH_CONTROLLER_V3;

      try {
        const commitment = (await publicClient.readContract({
          address: contractAddress,
          abi: ethControllerV3Abi,
          functionName: "makeCommitment",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: [params as any],
        })) as Hex;

        saveRegistrationState(label, { commitment });

        const commitHash = await writeContractAsync({
          functionName: "commit",
          args: [commitment],
        });

        setCurrentHash(commitHash);
        saveRegistrationState(label, { commitTxHash: commitHash });

        setStatus("waiting_commit");
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: commitHash }),
          {
            // 🚀 替换: hooks.registration.commit_confirming -> transaction.toast.confirming
            loading: t("transaction.toast.confirming"),
            // 🚀 替换: hooks.registration.commit_success -> transaction.step.commit_success
            success: t("transaction.step.commit_success"),
            // 🚀 替换: hooks.registration.commit_failed -> transaction.step.commit_failed
            error: t("transaction.step.commit_failed"),
          },
        );

        setStatus("counting_down");
        setCurrentHash(null);
        const WAIT_SECONDS = 65;
        setSecondsLeft(WAIT_SECONDS);

        startCountdown(WAIT_SECONDS, () => {
          if (isMounted.current) executeRegister(params);
        });
      } catch (err: unknown) {
        console.error(err);
        if (isMounted.current) {
          setStatus("error");
          removeRegistrationState(label);

          const error = err as Error & { shortMessage?: string };
          if (error.shortMessage?.includes("User rejected")) {
            // 🚀 替换: hooks.registration.commit_rejected -> transaction.toast.commit_rejected
            toast(t("transaction.toast.commit_rejected"));
          } else {
            // 🚀 替换: hooks.registration.process_interrupted -> transaction.toast.process_interrupted
            toast.error(t("transaction.toast.process_interrupted"));
          }
        }
      }
    },
    [address, publicClient, writeContractAsync, executeRegister, contracts, t],
  );

  const startCountdown = (seconds: number, onFinish: () => void) => {
    let left = seconds;
    setSecondsLeft(left);
    const timer = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(timer);
        return;
      }
      left -= 1;
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(timer);
        onFinish();
      }
    }, 1000);
  };

  return {
    status,
    secondsLeft,
    currentHash,
    startRegistration,
    checkAndResume,
    continueRegistration,
    resetStatus,
    isBusy:
      status !== "idle" &&
      status !== "success" &&
      status !== "error" &&
      status !== "registering",
  };
}
