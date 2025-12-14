// src/hooks/useEnsRegistration.ts

import { useState, useCallback } from "react";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { type Hex, toHex, pad } from "viem";
import { normalize } from "viem/ens";
import toast from "react-hot-toast";
import { MAINNET_ADDRESSES } from "../constants/addresses"; // 假设你有这个常量文件
// 导入生成的 ABI (确保路径正确)
import EnsControllerV3ABI from "../abis/EnsControllerV3.json";

// 定义清晰的状态机
export type RegistrationStatus =
  | "idle"
  | "committing" // 正在等待钱包确认 Commit 交易
  | "waiting_commit" // Commit 交易已发出，等待上链
  | "counting_down" // ENS 强制等待期 (60s)
  | "registering" // 正在等待钱包确认 Register 交易
  | "waiting_register" // Register 交易已发出，等待上链
  | "success"
  | "error";

export function useEnsRegistration() {
  const [status, setStatus] = useState<RegistrationStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // 辅助：生成随机 Secret (bytes32)
  const generateSecret = (): Hex => {
    const randomValues = crypto.getRandomValues(new Uint8Array(32));
    return toHex(randomValues) as unknown as Hex; // 简单转换为 Hex
  };

  // 核心函数：开始注册流程
  const startRegistration = useCallback(
    async (rawLabel: string, duration: bigint) => {
      if (!address || !publicClient) return;

      let label: string;

      try {
        // 使用原始输入 (rawLabel)
        label = normalize(rawLabel);
      } catch (e: unknown) {
        setStatus("error");
        const normalizationError = e as Error;
        toast.error(`名称不合法，无法注册: ${normalizationError.message}`);
        return;
      }

      setStatus("committing");
      const secret = generateSecret();
      const contractAddress = MAINNET_ADDRESSES.ENS_CONTROLLER_V3; // 你的合约地址

      // 生成准确的 referrer 参数，pad(string, { size: 32 }) 确保字符串是 32 字节长
      const REFERRER_HASH: Hex = pad(
        toHex(import.meta.env.VITE_ENS_REFERRER_HASH || "0x0"),
        { size: 32 },
      );

      try {
        // --- 1. 准备数据 & 计算 Commitment ---
        // 构建 Registration 结构体参数 (根据你的 ABI 调整)
        const registrationParams = {
          label,
          owner: address,
          duration,
          secret,
          resolver: MAINNET_ADDRESSES.ENS_PUBLIC_RESOLVER, // 使用默认 Resolver
          data: [],
          reverseRecord: false,
          referrer: REFERRER_HASH, // 你的 referrer
        };

        // 从合约读取 commitment hash (或者使用 viem 本地计算，这里为了稳健调用合约)
        const commitment = (await publicClient.readContract({
          address: contractAddress,
          abi: EnsControllerV3ABI,
          functionName: "makeCommitment",
          args: [registrationParams],
        })) as Hex;

        // --- 2. 发送 Commit 交易 ---
        const commitHash = await writeContractAsync({
          address: contractAddress,
          abi: EnsControllerV3ABI,
          functionName: "commit",
          args: [commitment],
        });

        setStatus("waiting_commit");
        // 使用 toast.promise 给用户即时反馈
        await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: commitHash }),
          {
            loading: "Commit 交易确认中...",
            success: "Commit 已上链！开始 60秒 倒计时...",
            error: "Commit 交易失败",
          },
        );

        // --- 3. 倒计时 60秒 (ENS 最小等待时间) ---
        setStatus("counting_down");
        let left = 60; // 建议设置为 65秒 以防区块时间偏差
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

        // --- 4. 发送 Register 交易 ---
        setStatus("registering");

        // 获取当前租金价格 (为了计算 msg.value)
        const priceData = (await publicClient.readContract({
          address: contractAddress,
          abi: EnsControllerV3ABI,
          functionName: "rentPrice",
          args: [label, duration],
        })) as { base: bigint; premium: bigint };

        // 加上 10% 缓冲以防价格波动
        const priceWithBuffer =
          ((priceData.base + priceData.premium) * 110n) / 100n;

        const registerHash = await writeContractAsync({
          address: contractAddress,
          abi: EnsControllerV3ABI,
          functionName: "register",
          args: [registrationParams],
          value: priceWithBuffer, // 必须带上 ETH
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
        // 1. 将 error 改名为 err，并标记为 unknown (或省略类型)
        console.error(err);
        setStatus("error");

        // 2. 在这里进行类型断言
        // 我们告诉 TS：这个错误是一个标准 Error，且可能包含 viem 的 shortMessage 属性
        const error = err as Error & { shortMessage?: string };

        // 3. 现在可以安全地访问属性了，linter 也不会报错
        toast.error(`注册流程中断: ${error.shortMessage || error.message}`);
      }
    },
    [address, publicClient, writeContractAsync],
  );

  return {
    status,
    secondsLeft,
    startRegistration,
    isBusy: status !== "idle" && status !== "success" && status !== "error",
  };
}
