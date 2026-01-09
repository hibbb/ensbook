// src/utils/validate.ts

import i18n from "../i18n/config";

export function validateLabel(label: string): void {
  if (!label) {
    // 🚀 替换: utils.validate.empty -> utils.validate.empty (保持不变，Key 没变)
    throw new Error(i18n.t("utils.validate.empty"));
  }

  if (label.includes(".")) {
    // 🚀 替换: utils.validate.subdomain -> utils.validate.subdomain
    throw new Error(i18n.t("utils.validate.subdomain"));
  }

  if (label.length < 3) {
    // 🚀 替换: utils.validate.too_short -> utils.validate.too_short
    throw new Error(i18n.t("utils.validate.too_short"));
  }
}
