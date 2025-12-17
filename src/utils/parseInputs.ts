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
};

const ETH_SUFFIX_REGEX = /\.eth$/i;

/**
 * ✅ 分隔符配置
 * 定义用于拆分输入字符串的符号。
 * * ⚠️ 注意：
 * 1. 数组中的字符会直接拼接到正则的 [] 中。
 * 2. 如果需要添加减号 "-", 请务必将其放在数组的最后一位，或写成 "\\-"。
 * 3. "\\s" 代表所有空白字符（空格、换行、Tab等）。
 */
const SEPARATORS = [
  ",", // 英文逗号
  "，", // 中文逗号
  "\\s", // 空白字符
  // ";", // 可选：分号
];

// ⚡️ 自动构建拆分正则
// 结果类似于: /[,，\s]+/
const SPLIT_REGEX = new RegExp(`[${SEPARATORS.join("")}]+`);

// 类型定义
export interface ClassifiedInputs {
  sameOwners: string[];
  linkOwners: string[];
  pureLabels: string[];
}

// ============================================================================
// 2. 独立辅助函数
// ============================================================================

const validateAndNormalize = (
  rawInput: string,
  hasSuffix: boolean,
): string | null => {
  // 长度检查
  const effectiveLength = hasSuffix ? rawInput.length - 4 : rawInput.length;
  if (effectiveLength < 3) return null;

  // 标准化
  let normalizedName: string;
  try {
    normalizedName = normalize(rawInput);
  } catch (error) {
    console.error("规范化失败:", error);
    // 优化：处理 Emoji 截断问题，并移除可能破坏 ID 的特殊符号
    const safeIdSnippet = Array.from(rawInput).slice(0, 10).join("");
    const toastId = `norm-error-${safeIdSnippet.replace(/[^a-zA-Z0-9]/g, "")}`;

    toast(`"${safeIdSnippet}..." 包含非法字符，已自动排除。`, {
      icon: "ℹ️",
      id: toastId,
      duration: 3000,
    });
    return null;
  }

  // 结构检查 (禁止非法子域名)
  if (hasSuffix) {
    const firstDotIndex = normalizedName.indexOf(".");
    const lastDotIndex = normalizedName.lastIndexOf(".");
    // 必须有且只有一个点，且该点不能是第一个字符
    if (firstDotIndex === -1 || firstDotIndex !== lastDotIndex) {
      return null;
    }
  } else {
    // 纯 Label 不能包含任何点
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
  };

  if (!rawInput || rawInput.length > 10000) {
    return result;
  }

  // 使用动态生成的正则进行分割
  const parts = rawInput.split(SPLIT_REGEX);

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;

    // 性能优化：检查桶是否已满
    if (
      result.sameOwners.length >= LIMITS.SAME &&
      result.linkOwners.length >= LIMITS.LINK &&
      result.pureLabels.length >= LIMITS.PURE
    ) {
      break;
    }

    // 内部处理函数
    const tryAdd = (
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

    // 分类逻辑
    if (part.startsWith("@")) {
      let name = part.slice(1);
      if (name) {
        if (!ETH_SUFFIX_REGEX.test(name)) name += ".eth";
        tryAdd(result.sameOwners, name, LIMITS.SAME, true);
      }
    } else if (part.startsWith("#")) {
      let name = part.slice(1);
      if (name) {
        if (!ETH_SUFFIX_REGEX.test(name)) name += ".eth";
        tryAdd(result.linkOwners, name, LIMITS.LINK, true);
      }
    } else {
      const label = part.replace(ETH_SUFFIX_REGEX, "");
      if (label) {
        tryAdd(result.pureLabels, label, LIMITS.PURE, false);
      }
    }
  }

  return result;
}
