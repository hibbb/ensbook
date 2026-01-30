// src/utils/validate.ts

import i18n from "../i18n/config";

export function validateLabel(label: string): void {
  if (!label) {
    throw new Error(i18n.t("utils.validate.empty"));
  }

  if (label.includes(".")) {
    throw new Error(i18n.t("utils.validate.subname"));
  }

  if (label.length < 3) {
    throw new Error(i18n.t("utils.validate.too_short"));
  }
}
