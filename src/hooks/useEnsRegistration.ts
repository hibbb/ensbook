// src/hooks/useEnsRegistration.ts

import { useState, useCallback } from "react";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { type Hex, toHex, pad } from "viem";
import { normalize } from "viem/ens";
import toast from "react-hot-toast";
import { MAINNET_ADDRESSES } from "../constants/addresses";
import EthControllerV3ABI from "../abis/EthControllerV3.json";

export type RegistrationStatus =
  | "idle"
  | "committing" // 等待钱包确认 Commit
  | "waiting_commit" // Commit 上链中
  | "counting_down" // 60秒倒计时
  | "registering" // 等待钱包确认 Register
  | "waiting_register" // Register 上链中
  | "success"
  | "error";

// ⚡️ 优化1：提取 Referrer 逻辑到 Hook 外部
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

  // ⚡️ 优化2：提供状态重置方法
  const resetStatus = useCallback(() => {
    setStatus("idle");
    setSecondsLeft(0);
  }, []);

  // 辅助：生成随机 Secret
  const generateSecret = (): Hex => {
    const randomValues = crypto.getRandomValues(new Uint8Array(32));
    return toHex(randomValues) as unknown as Hex;
  };

  const startRegistration = useCallback(
    async (rawLabel: string, duration: bigint) => {
      // ⚡️ 优化3：增加钱包连接检查和友好提示
      if (!address || !publicClient) {
        toast.error("请先连接钱包");
        return;
      }

      let label: string;
      try {
        // ⚡️ 优化4：移除 .eth 后缀，防止注册成 "name.eth.eth"
        label = normalize(rawLabel).replace(/\.eth$/, "");
      } catch (e: unknown) {
        setStatus("error");
        const normalizationError = e as Error;
        toast.error(`名称不合法: ${normalizationError.message}`);
        return;
      }

      setStatus("committing");
      const secret = generateSecret();
      const contractAddress = MAINNET_ADDRESSES.ETH_CONTROLLER_V3;
      const referrer = getFormattedReferrer();

      try {
        // 1. 准备数据
        const registrationParams = {
          label,
          owner: address,
          duration,
          secret,
          resolver: MAINNET_ADDRESSES.ENS_PUBLIC_RESOLVER,
          data: [],
          reverseRecord: false,
          referrer: referrer,
        };

        // 2. Commit 阶段
        // 注意：如果遇到 AbiEncodingLengthMismatchError，尝试将 args 改为:
        // args: [[label, address, duration, secret, ...]] (数组嵌套数组)
        const commitment = (await publicClient.readContract({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "makeCommitment",
          args: [registrationParams],
        })) as Hex;

        const commitHash = await writeContractAsync({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "commit",
          args: [commitment],
        });

        setStatus("waiting_commit");
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: commitHash }),
          {
            loading: "Commit 交易确认中...",
            success: "Commit 已上链！开始倒计时...",
            error: "Commit 交易失败",
          },
        );

        // 3. 倒计时阶段
        setStatus("counting_down");
        // 使用 65秒 缓冲
        let left = 65;
        setSecondsLeft(left);

        await new Promise<void>((resolve) => {
          const timer = setInterval(() => {
            left -= 1;
            setSecondsLeft(left);
            if (left <= 0) {
              clearInterval(timer);
              resolve();
            }
          }, 1000);
        });

        // 4. Register 阶段
        setStatus("registering");

        const priceData = (await publicClient.readContract({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "rentPrice",
          args: [label, duration],
        })) as { base: bigint; premium: bigint };

        const priceWithBuffer =
          ((priceData.base + priceData.premium) * 110n) / 100n;

        const registerHash = await writeContractAsync({
          address: contractAddress,
          abi: EthControllerV3ABI,
          functionName: "register",
          args: [registrationParams],
          value: priceWithBuffer,
        });

        setStatus("waiting_register");
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: registerHash }),
          {
            loading: "最终注册交易确认中...",
            success: `恭喜！${label}.eth 注册成功！`,
            error: "注册交易失败",
          },
        );

        setStatus("success");
      } catch (err: unknown) {
        console.error(err);
        setStatus("error");
        const error = err as Error & { shortMessage?: string };
        toast.error(`流程中断: ${error.shortMessage || error.message}`);
      }
    },
    [address, publicClient, writeContractAsync],
  );

  return {
    status,
    secondsLeft,
    startRegistration,
    resetStatus, // ⚡️ 导出重置方法
    isBusy: status !== "idle" && status !== "success" && status !== "error",
  };
}
