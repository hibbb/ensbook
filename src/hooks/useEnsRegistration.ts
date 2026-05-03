// src/hooks/useEnsRegistration.ts

import { useState, useCallback, useRef, useEffect } from "react";
import { usePublicClient, useAccount, useWriteContract } from "wagmi"; // 1. 引入 useWriteContract
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
import {
  ethControllerV3Abi, // 2. 引入 ABI (不再引入 useWriteEthControllerV3)
} from "../wagmi-generated";
import {
  REFERRER_ADDRESS_HASH,
  COMMITMENT_AGE_SECONDS,
  REGISTRATION_DELAY_BUFFER,
} from "../config/constants";
import { MAINNET_CONTRACTS } from "../config/contracts";
import { parseLabel, generateSecret } from "../utils/ens";
import { validateLabel } from "../utils/validate";

export function useEnsRegistration() {
  const [status, setStatus] = useState<RegistrationStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentHash, setCurrentHash] = useState<Hex | null>(null);
  const { t } = useTranslation();

  const registrationDataRef = useRef<RegistrationStruct | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { address } = useAccount();
  const publicClient = usePublicClient();

  // 3. 使用通用的 writeContractAsync
  const { writeContractAsync } = useWriteContract();

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setSecondsLeft(0);
    setCurrentHash(null);
    registrationDataRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const abandonRegistration = useCallback(() => {
    const currentLabel = registrationDataRef.current?.label;
    if (currentLabel) {
      removeRegistrationState(currentLabel);
      toast.success(t("transaction.toast.abort_success"));
    }
    resetStatus();
  }, [resetStatus, t]);

  const startResuming = useCallback(() => {
    resetStatus();
    setStatus("loading");
  }, [resetStatus]);

  const executeRegister = useCallback(async () => {
    const params = registrationDataRef.current;
    if (!publicClient || !address || !params) return;

    setStatus("registering");
    setCurrentHash(null);
    const contractAddress = MAINNET_CONTRACTS.ETH_CONTROLLER_V3;

    try {
      const priceData = (await publicClient.readContract({
        address: contractAddress,
        abi: ethControllerV3Abi,
        functionName: "rentPrice",
        args: [params.label, params.duration],
      })) as { base: bigint; premium: bigint };

      const priceWithBuffer =
        ((priceData.base + priceData.premium) * 110n) / 100n;

      // 4. 调用通用方法
      const registerHash = await writeContractAsync({
        address: contractAddress,
        abi: ethControllerV3Abi,
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
          loading: t("transaction.toast.confirming"),
          success: t("transaction.result.success_register"),
          error: t("transaction.toast.failed"),
        },
      );

      removeRegistrationState(params.label);
      setStatus("success");
    } catch (err: unknown) {
      console.error("Register Error:", err);
      if (isMounted.current) {
        const error = err as Error & { shortMessage?: string };
        if (error.shortMessage?.includes("User rejected")) {
          setStatus("ready");
          toast.error(t("transaction.toast.register_rejected"));
        } else {
          setStatus("error");
          toast.error(
            t("transaction.result.error_title") +
              ": " +
              (error.shortMessage || error.message),
          );
        }
      }
    }
  }, [address, publicClient, writeContractAsync, t]);

  const startCountdown = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let left = seconds;
    setSecondsLeft(left);

    timerRef.current = setInterval(() => {
      if (!isMounted.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      left -= 1;
      setSecondsLeft(left);
      if (left <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus("ready");
      }
    }, 1000);
  };

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
            startCountdown(result.secondsLeft);
          }
        }
      } catch (e) {
        console.error("恢复检查失败", e);
        toast.error(t("transaction.toast.recovery_failed"));
        setStatus("idle");
      }
    },
    [publicClient, t],
  );

  const startRegistration = useCallback(
    async (rawLabel: string, duration: bigint, customOwner?: Address) => {
      if (!address || !publicClient) {
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

      const ownerToUse = customOwner || (address as Address);

      const params: RegistrationStruct = {
        label,
        owner: ownerToUse,
        duration,
        secret,
        resolver: MAINNET_CONTRACTS.ENS_PUBLIC_RESOLVER,
        data: [],
        reverseRecord: 0,
        referrer,
      };

      registrationDataRef.current = params;
      saveRegistrationState(label, { registration: params });

      const contractAddress = MAINNET_CONTRACTS.ETH_CONTROLLER_V3;

      try {
        const commitment = (await publicClient.readContract({
          address: contractAddress,
          abi: ethControllerV3Abi,
          functionName: "makeCommitment",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: [params as any],
        })) as Hex;

        saveRegistrationState(label, { commitment });

        // 5. 调用通用方法
        const commitHash = await writeContractAsync({
          address: contractAddress,
          abi: ethControllerV3Abi,
          functionName: "commit",
          args: [commitment],
        });

        setCurrentHash(commitHash);
        saveRegistrationState(label, { commitTxHash: commitHash });

        setStatus("waiting_commit");
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: commitHash }),
          {
            loading: t("transaction.toast.confirming"),
            success: t("transaction.step.commit_success"),
            error: t("transaction.step.commit_failed"),
          },
        );

        setStatus("counting_down");
        setCurrentHash(null);
        const waitTime = COMMITMENT_AGE_SECONDS + REGISTRATION_DELAY_BUFFER;
        setSecondsLeft(waitTime);

        startCountdown(waitTime);
      } catch (err: unknown) {
        console.error(err);
        if (isMounted.current) {
          setStatus("error");
          removeRegistrationState(label);

          const error = err as Error & { shortMessage?: string };
          if (error.shortMessage?.includes("User rejected")) {
            toast(t("transaction.toast.commit_rejected"));
          } else {
            toast.error(t("transaction.toast.process_interrupted"));
          }
        }
      }
    },
    [address, publicClient, writeContractAsync, t], // 依赖项更新
  );

  return {
    status,
    secondsLeft,
    currentHash,
    startRegistration,
    checkAndResume,
    resetStatus,
    abandonRegistration,
    startResuming,
    confirmRegistration: executeRegister,
    isBusy:
      status !== "idle" &&
      status !== "success" &&
      status !== "error" &&
      status !== "ready",
  };
}
