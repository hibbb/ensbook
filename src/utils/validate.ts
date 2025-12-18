// src/utils/validate.ts

/**
 * 校验 Label 是否符合注册要求
 * @throws Error 如果校验失败
 */
export function validateLabel(label: string): void {
  if (!label) {
    throw new Error("域名不能为空");
  }

  if (label.includes(".")) {
    throw new Error("仅支持注册二级域名 (如 alice.eth)，不支持子域名");
  }

  if (label.length < 3) {
    throw new Error("ENS 域名长度至少为 3 个字符");
  }

  // 你可以在这里添加更多规则，比如检查非法字符等
}
