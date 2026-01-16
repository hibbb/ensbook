// src/components/NameTable/headers/MarketHeader.tsx

import { useTranslation } from "react-i18next";
import { ThWrapper } from "./ThWrapper";

export const MarketHeader = () => {
  const { t } = useTranslation();

  return (
    <ThWrapper className="justify-end px-2">
      <span>{t("table.header.market")}</span>
    </ThWrapper>
  );
};
