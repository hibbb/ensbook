// src/utils/validate.ts

import i18n from "../i18n/config"; // 🚀 直接引入实例

/**
 * 校验 Label 是否符合注册要求
 * @throws Error 如果校验失败
 */
export function validateLabel(label: string): void {
  if (!label) {
    throw new Error(i18n.t("utils.validate.empty"));
  }

  if (label.includes(".")) {
    throw new Error(i18n.t("utils.validate.subdomain"));
  }

  if (label.length < 3) {
    throw new Error(i18n.t("utils.validate.too_short"));
  }
}
