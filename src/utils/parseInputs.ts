// src/utils/parseInputs.ts

import { normalize } from "viem/ens";
import toast from "react-hot-toast";

// ============================================================================
// 1. 常量与配置
// ============================================================================

const LIMITS = {
  SAME: 5,
  LINK: 5,
  PURE: 500,
  ADDRESS: 10, // 🚀 新增：限制单次查询的地址数量
};

const ETH_SUFFIX_REGEX = /\.eth$/i;
// 🚀 新增：以太坊地址正则 (0x开头，后跟40位16进制字符)
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
  linkOwners: string[];
  pureLabels: string[];
  ethAddresses: string[]; // 🚀 新增字段
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
    linkOwners: [],
    pureLabels: [],
    ethAddresses: [], // 🚀 初始化
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
      result.sameOwners.length >= LIMITS.SAME &&
      result.linkOwners.length >= LIMITS.LINK &&
      result.pureLabels.length >= LIMITS.PURE &&
      result.ethAddresses.length >= LIMITS.ADDRESS // 🚀 检查地址桶
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

    // 🚀 辅助：添加以太坊地址
    const tryAddAddress = (address: string) => {
      if (result.ethAddresses.length >= LIMITS.ADDRESS) return;
      // 统一转小写以匹配 Graph 索引
      const lowerAddr = address.toLowerCase();
      if (!result.ethAddresses.includes(lowerAddr)) {
        result.ethAddresses.push(lowerAddr);
      }
    };

    // 分类逻辑
    if (part.startsWith("@")) {
      let name = part.slice(1);
      if (name) {
        // 🚀 优先检查是否为地址
        if (ETH_ADDRESS_REGEX.test(name)) {
          tryAddAddress(name);
        } else {
          // 不是地址，按原有 ENS 逻辑处理
          if (!ETH_SUFFIX_REGEX.test(name)) name += ".eth";
          tryAddName(result.sameOwners, name, LIMITS.SAME, true);
        }
      }
    } else if (part.startsWith("#")) {
      let name = part.slice(1);
      if (name) {
        // 🚀 优先检查是否为地址
        if (ETH_ADDRESS_REGEX.test(name)) {
          tryAddAddress(name);
        } else {
          if (!ETH_SUFFIX_REGEX.test(name)) name += ".eth";
          tryAddName(result.linkOwners, name, LIMITS.LINK, true);
        }
      }
    } else {
      // 普通 Label
      const label = part.replace(ETH_SUFFIX_REGEX, "");
      if (label) {
        tryAddName(result.pureLabels, label, LIMITS.PURE, false);
      }
    }
  }
  console.log("Parsed inputs:", result);

  return result;
}
