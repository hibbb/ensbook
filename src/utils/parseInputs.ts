// src/utils/parseInputs.ts

import { normalize } from "viem/ens";
import toast from "react-hot-toast";
import { INPUT_LIMITS } from "../config/constants";

// ============================================================================
// 1. 常量与配置
// ============================================================================

const ETH_SUFFIX_REGEX = /\.eth$/i;
// 以太坊地址正则 (0x开头，后跟40位16进制字符)
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const SEPARATORS = [
  ",", // 英文逗号
  "，", // 中文逗号
  "\\s", // 空白字符
  // ";", // 可选：分号
];

const SPLIT_REGEX = new RegExp(`[${SEPARATORS.join("")}]+`);

// 类型定义
export interface ClassifiedInputs {
  sameOwners: string[];
  pureLabels: string[];
  ethAddresses: string[];
}

// ============================================================================
// 2. 独立辅助函数
// ============================================================================

const validateAndNormalize = (
  rawInput: string,
  hasSuffix: boolean,
): string | null => {
  // ... (保持原有 validateAndNormalize 逻辑不变)
  const effectiveLength = hasSuffix ? rawInput.length - 4 : rawInput.length;
  if (effectiveLength < 3) return null;

  let normalizedName: string;
  try {
    normalizedName = normalize(rawInput);
  } catch (error) {
    console.error("规范化失败:", error);
    const safeIdSnippet = Array.from(rawInput).slice(0, 10).join("");
    const toastId = `norm-error-${safeIdSnippet.replace(/[^a-zA-Z0-9]/g, "")}`;

    toast(`"${safeIdSnippet}..." 包含非法字符，已自动排除。`, {
      icon: "ℹ️",
      id: toastId,
      duration: 3000,
    });
    return null;
  }

  if (hasSuffix) {
    const firstDotIndex = normalizedName.indexOf(".");
    const lastDotIndex = normalizedName.lastIndexOf(".");
    if (firstDotIndex === -1 || firstDotIndex !== lastDotIndex) {
      return null;
    }
  } else {
    if (normalizedName.includes(".")) {
      return null;
    }
  }

  return normalizedName;
};

// ============================================================================
// 3. 主函数：parseAndClassifyInputs
// ============================================================================

export function parseAndClassifyInputs(rawInput: string): ClassifiedInputs {
  const result: ClassifiedInputs = {
    sameOwners: [],
    pureLabels: [],
    ethAddresses: [],
  };

  if (!rawInput || rawInput.length > 10000) {
    return result;
  }

  const parts = rawInput.split(SPLIT_REGEX);

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;

    // 性能优化：检查所有桶是否已满
    if (
      result.sameOwners.length >= INPUT_LIMITS.SAME &&
      result.pureLabels.length >= INPUT_LIMITS.PURE &&
      result.ethAddresses.length >= INPUT_LIMITS.ADDRESS
    ) {
      break;
    }

    // 辅助：添加普通 ENS 名称
    const tryAddName = (
      targetArr: string[],
      name: string,
      limit: number,
      expectSuffix: boolean,
    ) => {
      if (targetArr.length >= limit) return;
      const validName = validateAndNormalize(name, expectSuffix);
      if (validName && !targetArr.includes(validName)) {
        targetArr.push(validName);
      }
    };

    // 辅助：添加以太坊地址
    const tryAddAddress = (address: string) => {
      if (result.ethAddresses.length >= INPUT_LIMITS.ADDRESS) return;
      // 统一转小写以匹配 Graph 索引
      const lowerAddr = address.toLowerCase();
      if (!result.ethAddresses.includes(lowerAddr)) {
        result.ethAddresses.push(lowerAddr);
      }
    };

    // 🚀 核心分类逻辑优化 (版本 2)

    // 1. 优先检查：是否为纯以太坊地址 (0x...)
    if (ETH_ADDRESS_REGEX.test(part)) {
      tryAddAddress(part);
      continue; // 匹配成功，直接处理下一个
    }

    // 2. 检查：是否为 @ 开头的 Owner 查询
    if (part.startsWith("@")) {
      let name = part.slice(1);
      if (name) {
        // 不需要再检查是否为地址了，因为上面的正则已经拦截了 0x 地址
        // 如果用户输入 @0x123...，会被视为尝试查找名为 "0x123..." 的 ENS 域名的持有者，这在逻辑上也是说得通的
        if (!ETH_SUFFIX_REGEX.test(name)) name += ".eth";
        tryAddName(result.sameOwners, name, INPUT_LIMITS.SAME, true);
      }
      continue;
    }

    // 3. 默认：视为普通 Label 或 ENS 域名
    // 移除 # 相关的特殊处理
    const label = part.replace(ETH_SUFFIX_REGEX, "");
    if (label) {
      tryAddName(result.pureLabels, label, INPUT_LIMITS.PURE, false);
    }
  }

  return result;
}
