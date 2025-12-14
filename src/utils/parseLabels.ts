// src/utils/parseLabels.ts

export interface ClassifiedLabels {
  sameOwners: string[]; // 必须以 .eth 结尾
  linkOwners: string[]; // 必须以 .eth 结尾
  pureLabels: string[]; // 必须无 .eth 后缀
}

/**
 * 解析、清洗、分类、格式化后缀并去重用户的输入。
 *
 * 🔄 优化点：
 * 1. split正则加入 `+`，自动合并连续的分隔符 (如 "a,,b" -> ["a", "b"])。
 * 2. 使用不区分大小写的正则 `/\.eth$/i` 处理后缀，防止 ".ETH.eth" 错误。
 * 3. 保持代码的声明式风格，逻辑清晰。
 */
export function parseAndClassifyLabels(rawInput: string): ClassifiedLabels {
  // 1. 安全检查
  if (!rawInput || rawInput.length > 10000) {
    return { sameOwners: [], linkOwners: [], pureLabels: [] };
  }

  const MAX_SAME_OWNERS = 5;
  const MAX_LINK_OWNERS = 5;
  const MAX_PURE_LABELS = 50;

  // 2. 预定义正则：匹配以 .eth 结尾 (忽略大小写)
  const ethSuffixRegex = /\.eth$/i;

  return rawInput.split(/[,，\n]+/).reduce<ClassifiedLabels>(
    (acc, rawPart) => {
      const part = rawPart.trim();
      if (!part) return acc;

      // --- 辅助函数：安全添加元素 ---
      // 使用闭包简化重复的 "非空 + 去重 + 数量限制" 逻辑
      const pushUnique = (
        targetArray: string[],
        item: string,
        limit: number,
      ) => {
        if (item && !targetArray.includes(item) && targetArray.length < limit) {
          targetArray.push(item);
        }
      };

      // --- A: @sameOwners (补全 .eth) ---
      if (part.startsWith("@")) {
        let name = part.slice(1).trim();
        // 只有当后缀不存在时才添加 (忽略大小写)
        if (name && !ethSuffixRegex.test(name)) {
          name += ".eth";
        }
        pushUnique(acc.sameOwners, name, MAX_SAME_OWNERS);
      }
      // --- B: #linkOwners (补全 .eth) ---
      else if (part.startsWith("#")) {
        let name = part.slice(1).trim();
        if (name && !ethSuffixRegex.test(name)) {
          name += ".eth";
        }
        pushUnique(acc.linkOwners, name, MAX_LINK_OWNERS);
      }
      // --- C: pureLabels (移除 .eth) ---
      else {
        // 使用正则替换，不论是 .ETH 还是 .eth 都能干净移除
        const label = part.replace(ethSuffixRegex, "");
        pushUnique(acc.pureLabels, label, MAX_PURE_LABELS);
      }

      return acc;
    },
    { sameOwners: [], linkOwners: [], pureLabels: [] },
  );
}
