// src/utils/parseLabels.ts

import { normalize } from "viem/ens";
import toast from "react-hot-toast";

// ============================================================================
// 1. 常量定义
// ============================================================================
const LIMITS = {
  SAME: 5,
  LINK: 5,
  PURE: 50,
};
const ETH_SUFFIX_REGEX = /\.eth$/i;
const SPLIT_REGEX = /[,，\n\s]+/; // 优化：加入 \s 以支持空格分隔

export interface ClassifiedLabels {
  sameOwners: string[];
  linkOwners: string[];
  pureLabels: string[];
}

// ============================================================================
// 2. 独立辅助函数
// ============================================================================

/**
 * 核心验证器：长度、标准化、层级结构
 */
const validateAndNormalize = (
  rawInput: string,
  hasSuffix: boolean,
): string | null => {
  // A. 长度检查 (Length Check)
  // 如果是 .eth 后缀模式，有效长度需减去 4 (".eth")
  const effectiveLength = hasSuffix ? rawInput.length - 4 : rawInput.length;
  if (effectiveLength < 3) return null;

  // B. ENS 标准化 (Normalization)
  let normalizedName: string;
  try {
    normalizedName = normalize(rawInput);
  } catch (error) {
    // 仅在控制台记录错误，Toast 提示
    console.log(error);
    const toastId = `norm-error-${rawInput.slice(0, 20)}`;
    toast(`"${rawInput}" 包含非法字符，已自动排除。`, {
      icon: "ℹ️",
      id: toastId,
      duration: 3000,
    });
    return null;
  }

  // C. 结构/层级检查 (Structure Check)
  if (hasSuffix) {
    // 情况 1: Owner 类型 (必须是二级域名，如 "abc.eth")
    // 逻辑：标准化后，必须包含 ".eth"，且不应有额外的点号 (即总共只能有 1 个点)
    // 优化：直接检查是否包含子域名的点号
    const firstDotIndex = normalizedName.indexOf(".");
    const lastDotIndex = normalizedName.lastIndexOf(".");

    // 如果第一个点就是最后一个点 (只有一个点)，且它存在 -> 合法
    // 如果有多个点 (first !== last) -> 非法子域名
    if (firstDotIndex === -1 || firstDotIndex !== lastDotIndex) {
      return null;
    }
  } else {
    // 情况 2: 纯 Label 类型 (如 "abc")
    // 逻辑：不能包含任何点号
    if (normalizedName.includes(".")) {
      return null;
    }
  }

  return normalizedName;
};

// ============================================================================
// 3. 主函数
// ============================================================================

export function parseAndClassifyLabels(rawInput: string): ClassifiedLabels {
  // 初始化结果容器
  const result: ClassifiedLabels = {
    sameOwners: [],
    linkOwners: [],
    pureLabels: [],
  };

  // 1. 基础边界检查
  if (!rawInput || rawInput.length > 10000) {
    return result;
  }

  // 2. 分割字符串
  const parts = rawInput.split(SPLIT_REGEX);

  // 3. 循环处理 (使用 for...of 以支持 early break)
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;

    // ⚡️ 性能优化：如果所有桶都满了，提前终止循环
    const isSameFull = result.sameOwners.length >= LIMITS.SAME;
    const isLinkFull = result.linkOwners.length >= LIMITS.LINK;
    const isPureFull = result.pureLabels.length >= LIMITS.PURE;

    if (isSameFull && isLinkFull && isPureFull) {
      break;
    }

    // --- 分类与处理逻辑 ---

    // 内部帮助函数：减少重复代码，处理添加/尝试逻辑
    const tryAdd = (
      targetArr: string[],
      name: string,
      limit: number,
      expectSuffix: boolean,
    ) => {
      if (targetArr.length >= limit) return; // 单个桶满检查

      const validName = validateAndNormalize(name, expectSuffix);
      if (validName && !targetArr.includes(validName)) {
        targetArr.push(validName);
      }
    };

    // A: @sameOwners
    if (part.startsWith("@")) {
      let name = part.slice(1);
      if (name) {
        if (!ETH_SUFFIX_REGEX.test(name)) name += ".eth";
        tryAdd(result.sameOwners, name, LIMITS.SAME, true);
      }
    }
    // B: #linkOwners
    else if (part.startsWith("#")) {
      let name = part.slice(1);
      if (name) {
        if (!ETH_SUFFIX_REGEX.test(name)) name += ".eth";
        tryAdd(result.linkOwners, name, LIMITS.LINK, true);
      }
    }
    // C: pureLabels
    else {
      // 移除 .eth 后缀 (如果用户手误输入了 .eth 但没加前缀，视为 pureLabel 提取)
      const label = part.replace(ETH_SUFFIX_REGEX, "");
      if (label) {
        tryAdd(result.pureLabels, label, LIMITS.PURE, false);
      }
    }
  }

  return result;
}
