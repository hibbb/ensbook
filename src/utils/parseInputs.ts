// src/utils/parseInputs.ts

import { normalize } from "viem/ens";
import toast from "react-hot-toast";
import { INPUT_LIMITS } from "../config/constants";
import i18n from "../i18n/config"; // 🚀

// ... 常量定义保持不变 ...
const ETH_SUFFIX_REGEX = /\.eth$/i;
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const SEPARATORS = [",", "，", "\\s"];
const SPLIT_REGEX = new RegExp(`[${SEPARATORS.join("")}]+`);

export interface ClassifiedInputs {
  sameOwners: string[];
  pureLabels: string[];
  ethAddresses: string[];
}

const validateAndNormalize = (
  rawInput: string,
  hasSuffix: boolean,
): string | null => {
  const effectiveLength = hasSuffix ? rawInput.length - 4 : rawInput.length;
  if (effectiveLength < 3) return null;

  let normalizedName: string;
  try {
    normalizedName = normalize(rawInput);
  } catch (error) {
    console.error("规范化失败:", error);
    const safeIdSnippet = Array.from(rawInput).slice(0, 10).join("");
    const toastId = `norm-error-${safeIdSnippet.replace(/[^a-zA-Z0-9]/g, "")}`;

    toast(i18n.t("utils.parse.norm_error", { snippet: safeIdSnippet }), {
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

// ... parseAndClassifyInputs 主函数保持不变 ...
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

    if (
      result.sameOwners.length >= INPUT_LIMITS.SAME &&
      result.pureLabels.length >= INPUT_LIMITS.PURE &&
      result.ethAddresses.length >= INPUT_LIMITS.ADDRESS
    ) {
      break;
    }

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

    const tryAddAddress = (address: string) => {
      if (result.ethAddresses.length >= INPUT_LIMITS.ADDRESS) return;
      const lowerAddr = address.toLowerCase();
      if (!result.ethAddresses.includes(lowerAddr)) {
        result.ethAddresses.push(lowerAddr);
      }
    };

    if (ETH_ADDRESS_REGEX.test(part)) {
      tryAddAddress(part);
      continue;
    }

    if (part.startsWith("@")) {
      let name = part.slice(1);
      if (name) {
        if (!ETH_SUFFIX_REGEX.test(name)) name += ".eth";
        tryAddName(result.sameOwners, name, INPUT_LIMITS.SAME, true);
      }
      continue;
    }

    const label = part.replace(ETH_SUFFIX_REGEX, "");
    if (label) {
      tryAddName(result.pureLabels, label, INPUT_LIMITS.PURE, false);
    }
  }

  return result;
}
