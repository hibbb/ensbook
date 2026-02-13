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
import {
  useWriteEthControllerV3,
  ethControllerV3Abi,
} from "../wagmi-generated";
import { REFERRER_ADDRESS_HASH } from "../config/constants";
import { MAINNET_CONTRACTS } from "../config/contracts";
import { parseLabel, generateSecret } from "../utils/ens";
import { validateLabel } from "../utils/validate";
import {
  COMMITMENT_AGE_SECONDS,
  REGISTRATION_DELAY_BUFFER,
} from "../config/constants";

export function useEnsRegistration() {
  const [status, setStatus] = useState<RegistrationStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentHash, setCurrentHash] = useState<Hex | null>(null);
  const { t } = useTranslation();

  const registrationDataRef = useRef<RegistrationStruct | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteEthControllerV3();

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
    // 参数直接从 ref 读取，不需要传参
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
          // 如果用户拒绝，回退到 ready 状态，允许再次点击
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
        // 倒计时结束，准备就绪
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
            // 恢复倒计时
            startCountdown(result.secondsLeft);
          }
          // 注意：如果 checkRegStatus 返回的是 'ready' (即时间已到)，
          // 上面的 setStatus(result.status) 已经将其设为 ready 了，
          // UI 会自动显示 "Start Registration" 按钮，无需额外操作。
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
            loading: t("transaction.toast.confirming"),
            success: t("transaction.step.commit_success"),
            error: t("transaction.step.commit_failed"),
          },
        );

        setStatus("counting_down");
        setCurrentHash(null);
        setSecondsLeft(COMMITMENT_AGE_SECONDS + REGISTRATION_DELAY_BUFFER);

        // 启动倒计时，结束后进入 ready
        startCountdown(COMMITMENT_AGE_SECONDS + REGISTRATION_DELAY_BUFFER);
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
    [address, publicClient, writeContractAsync, t],
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
