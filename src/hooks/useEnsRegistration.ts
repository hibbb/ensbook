import { useState, useCallback, useRef, useEffect } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { type Hex, type Address } from "viem";
import { normalize } from "viem/ens";
import toast from "react-hot-toast";
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

  // Ref: 存储注册参数，保证跨渲染周期的数据一致性
  const registrationDataRef = useRef<RegistrationStruct | null>(null);

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteEthControllerV3();
  const chainId = useChainId(); // 获取当前链ID
  const contracts = getContracts(chainId); // 获取对应合约地址

  // Ref: 追踪组件挂载状态
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
    registrationDataRef.current = null;
  }, []);

  // ----------------------------------------------------------------
  // 核心逻辑：执行注册 (Register)
  // ----------------------------------------------------------------
  const executeRegister = useCallback(
    async (params: RegistrationStruct) => {
      if (!publicClient || !address) return;

      // 🛡️ 防御：如果已经在处理中，忽略调用 (防止重复点击)
      // 注意：这里需要配合 UI 的 disabled 状态，但 Ref 检查是最后一道防线
      // (由于 setStatus 是异步的，这里其实主要靠 status 状态机和 UI 禁用)

      setStatus("registering");
      const contractAddress = contracts.ETH_CONTROLLER_V3;

      try {
        // 1. 重新估价 (确保金额准确)
        const priceData = (await publicClient.readContract({
          address: contractAddress,
          abi: ethControllerV3Abi,
          functionName: "rentPrice",
          args: [params.label, params.duration],
        })) as { base: bigint; premium: bigint };

        const priceWithBuffer =
          ((priceData.base + priceData.premium) * 110n) / 100n;

        // 2. 发起交易
        const registerHash = await writeContractAsync({
          functionName: "register",
          args: [params],
          value: priceWithBuffer,
        });

        // 💾 Storage Update: 记录 regTxHash
        saveRegistrationState(params.label, { regTxHash: registerHash });

        setStatus("waiting_register");
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: registerHash }),
          {
            loading: "最终注册交易确认中...",
            success: `恭喜！${params.label}.eth 注册成功！`,
            error: "注册交易失败",
          },
        );

        // 🧹 Cleanup: 成功后彻底清除本地数据
        removeRegistrationState(params.label);
        setStatus("success");
      } catch (err: unknown) {
        console.error("Register Error:", err);
        if (isMounted.current) {
          setStatus("error"); // 保持 error 状态，允许重试
          const error = err as Error & { shortMessage?: string };

          // 友好提示：如果是用户拒绝，提示手动重试
          if (error.shortMessage?.includes("User rejected")) {
            toast.error("您取消了交易，请点击按钮重试");
          } else {
            toast.error(`注册失败: ${error.shortMessage || error.message}`);
          }
        }
      }
    },
    [address, publicClient, writeContractAsync, contracts],
  );

  // ----------------------------------------------------------------
  // 功能：检查并恢复 (Resume)
  // ----------------------------------------------------------------
  const checkAndResume = useCallback(
    async (rawLabel: string) => {
      if (!publicClient) return;

      try {
        const label = normalize(rawLabel).replace(/\.eth$/, "");
        const result = await checkRegStatus(publicClient, label);

        // 🛡️ 优化：如果检测到状态是 idle 且有 errorMessage (说明过期了)，主动清理脏数据
        if (result.status === "idle" && result.errorMessage) {
          removeRegistrationState(label);
          toast.error(result.errorMessage); // 提示用户“Commit 已过期”
          return;
        }

        if (result.localState && result.localState.registration) {
          console.log("🔍 恢复状态:", result.status);

          // 恢复内存数据
          registrationDataRef.current = result.localState.registration;
          setStatus(result.status);

          if (result.errorMessage && result.status !== "idle") {
            toast.error(result.errorMessage);
          }

          // 处理倒计时
          if (result.status === "counting_down") {
            setSecondsLeft(result.secondsLeft);
            startCountdown(result.secondsLeft, () => {
              // 倒计时结束，自动触发
              if (registrationDataRef.current && isMounted.current) {
                executeRegister(registrationDataRef.current);
              }
            });
          }
          // 如果是 'registering'，不做自动操作，等待用户点击 UI 按钮
        }
      } catch (e) {
        console.error("恢复检查失败", e);
      }
    },
    [publicClient, executeRegister],
  );

  // ----------------------------------------------------------------
  // 功能：手动继续 (Continue)
  // ----------------------------------------------------------------
  const continueRegistration = useCallback(() => {
    if (registrationDataRef.current) {
      executeRegister(registrationDataRef.current);
    } else {
      toast.error("无法恢复注册数据，请重新开始");
      resetStatus();
    }
  }, [executeRegister, resetStatus]);

  // ----------------------------------------------------------------
  // 功能：全新开始 (Start)
  // ----------------------------------------------------------------
  const startRegistration = useCallback(
    async (rawLabel: string, duration: bigint) => {
      if (!address || !publicClient) {
        toast.error("请先连接钱包");
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

      // 初始化状态
      registrationDataRef.current = params;
      saveRegistrationState(label, { registration: params });

      const contractAddress = contracts.ETH_CONTROLLER_V3;

      try {
        // 1. Commit
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
        saveRegistrationState(label, { commitTxHash: commitHash });

        setStatus("waiting_commit");
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: commitHash }),
          {
            loading: "Commit 确认中...",
            success: "Commit 已上链",
            error: "Commit 失败",
          },
        );

        // 2. Countdown
        setStatus("counting_down");
        const WAIT_SECONDS = 65;
        setSecondsLeft(WAIT_SECONDS);

        startCountdown(WAIT_SECONDS, () => {
          if (isMounted.current) executeRegister(params);
        });
      } catch (err: unknown) {
        console.error(err);
        if (isMounted.current) {
          setStatus("error");
          toast.error("流程中断，请检查控制台");
        }
      }
    },
    [address, publicClient, writeContractAsync, executeRegister, contracts],
  );

  // 辅助：倒计时 (独立出来，避免闭包陷阱)
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
