// src/components/NameTable/cells/LookupsCell.tsx

import { useTranslation } from "react-i18next";
import { getAvailableLookups } from "../../../utils/lookupProvider";
import type { NameRecord } from "../../../types/ensNames";
import { Tooltip } from "../../ui/Tooltip";

interface LookupsCellProps {
  record: NameRecord;
}

export const LookupsCell = ({ record }: LookupsCellProps) => {
  const { t } = useTranslation();
  const availableLookups = getAvailableLookups(record);

  return (
    <div className="h-12 flex items-center justify-start gap-1.5">
      {availableLookups.map((item) => (
        <Tooltip key={item.key} content={item.getLabel(record, t)}>
          <a
            href={item.getLink(record)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-white transition-all hover:scale-110 overflow-hidden border border-gray-300 opacity-45 hover:opacity-100"
          >
            <img
              src={item.icon}
              alt={item.key}
              className="w-4 h-4 object-contain"
            />
          </a>
        </Tooltip>
      ))}
    </div>
  );
};
