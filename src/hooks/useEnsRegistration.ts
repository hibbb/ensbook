import { useState, useCallback, useRef, useEffect } from "react";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { type Hex, toHex, pad, type Address } from "viem";
import { normalize } from "viem/ens";
import toast from "react-hot-toast";
import { MAINNET_ADDRESSES } from "../constants/addresses";
import EthControllerV3ABI from "../abis/EthControllerV3.json";
import {
  type RegistrationStruct,
  type RegistrationStatus,
} from "../types/ensRegistration";
import {
  saveRegistrationState,
  removeRegistrationState,
} from "../utils/storage";

// 提取 Referrer 逻辑 (静态)
const getFormattedReferrer = (): Hex => {
  const rawReferrer =
    import.meta.env.VITE_ENS_REFERRER_HASH ||
    "0x0000000000000000000000000000000000000000";
  return pad(rawReferrer.toLowerCase() as Hex, { size: 32 });
};

export function useEnsRegistration() {
  const [status, setStatus] = useState<RegistrationStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // 组件挂载状态追踪 (防止卸载后状态更新报错)
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setSecondsLeft(0);
  }, []);

  const generateSecret = (): Hex => {
    const randomValues = crypto.getRandomValues(new Uint8Array(32));
    return toHex(randomValues) as unknown as Hex;
  };

  const startRegistration = useCallback(
    async (rawLabel: string, duration: bigint) => {
      // 0. 基础环境检查
      if (!address || !publicClient) {
        toast.error("请先连接钱包");
        return;
      }

      let label: string;
      try {
        // 1. Label 标准化与校验
        label = normalize(rawLabel).replace(/\.eth$/, "");
        if (label.includes(".")) throw new Error("不支持子域名");
        if (label.length < 3) throw new Error("长度至少 3 字符");
      } catch (e: unknown) {
        setStatus("error");
        const err = e as Error;
        toast.error(`名称格式错误: ${err.message}`);
        return;
      }

      setStatus("committing");

      // 2. 初始化注册参数
      const secret = generateSecret();
      const referrer = getFormattedReferrer();

      // 构建 RegistrationStruct
      const registrationParams: RegistrationStruct = {
        label,
        owner: address as Address,
        duration,
        secret,
        resolver: MAINNET_ADDRESSES.ENS_PUBLIC_RESOLVER,
        data: [],
        reverseRecord: false,
        referrer,
      };

      // 💾 [Storage] 保存初始状态 (包含 Secret)
      saveRegistrationState(label, { registration: registrationParams });

      const contractAddress = MAINNET_ADDRESSES.ETH_CONTROLLER_V3;

      try {
        // 准备合约调用参数 (将 Struct 展平为数组，避免 ABI 编码错误)
        const paramsArray = [
          registrationParams.label,
          registrationParams.owner,
          registrationParams.duration,
          registrationParams.secret,
          registrationParams.resolver,
          registrationParams.data,
          registrationParams.reverseRecord,
          registrationParams.referrer,
        ];

        // --- Commit 阶段 ---

        // 计算 Commitment Hash
        const commitment = (await publicClient.readContract({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "makeCommitment",
          args: [paramsArray],
        })) as Hex;

        // 💾 [Storage] 更新 Commitment
        saveRegistrationState(label, { commitment });

        // 发起 Commit 交易
        const commitHash = await writeContractAsync({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "commit",
          args: [commitment],
        });

        // 💾 [Storage] 更新 Commit Tx Hash
        saveRegistrationState(label, { commitTxHash: commitHash });

        setStatus("waiting_commit");
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: commitHash }),
          {
            loading: "Commit 交易确认中...",
            success: "Commit 已上链！请保持页面开启...",
            error: "Commit 交易失败",
          },
        );

        // --- 倒计时阶段 ---
        setStatus("counting_down");
        const WAIT_SECONDS = 65;
        setSecondsLeft(WAIT_SECONDS);

        await new Promise<void>((resolve, reject) => {
          let left = WAIT_SECONDS;
          const timer = setInterval(() => {
            if (!isMounted.current) {
              clearInterval(timer);
              reject(new Error("Component unmounted"));
              return;
            }
            left -= 1;
            setSecondsLeft(left);
            if (left <= 0) {
              clearInterval(timer);
              resolve();
            }
          }, 1000);
        });

        // --- Register 阶段 ---
        if (!isMounted.current) return;
        setStatus("registering");

        // 重新获取价格
        const priceData = (await publicClient.readContract({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "rentPrice",
          args: [label, duration],
        })) as { base: bigint; premium: bigint };

        // 10% 缓冲
        const priceWithBuffer =
          ((priceData.base + priceData.premium) * 110n) / 100n;

        // 发起 Register 交易
        const registerHash = await writeContractAsync({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "register",
          args: [paramsArray], // 使用之前保存的相同参数
          value: priceWithBuffer,
        });

        // 💾 [Storage] 更新 Register Tx Hash (防止最后一步页面崩溃找不到交易)
        saveRegistrationState(label, { regTxHash: registerHash });

        setStatus("waiting_register");
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: registerHash }),
          {
            loading: "最终注册交易确认中...",
            success: `恭喜！${label}.eth 注册成功！`,
            error: "注册交易失败",
          },
        );

        // 💾 [Storage] 成功清理：删除本地存储
        removeRegistrationState(label);

        setStatus("success");
      } catch (err: unknown) {
        console.error(err);
        if (isMounted.current) {
          setStatus("error");
          const error = err as Error & { shortMessage?: string };
          toast.error(`流程中断: ${error.shortMessage || error.message}`);
        }
      }
    },
    [address, publicClient, writeContractAsync],
  );

  return {
    status,
    secondsLeft,
    startRegistration,
    resetStatus,
    isBusy: status !== "idle" && status !== "success" && status !== "error",
  };
}
