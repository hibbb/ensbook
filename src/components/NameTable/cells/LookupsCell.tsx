import { getAvailableLookups } from "../../../utils/lookupProvider";
import type { NameRecord } from "../../../types/ensNames";

interface LookupsCellProps {
  record: NameRecord;
  chainId?: number;
}

export const LookupsCell = ({ record, chainId }: LookupsCellProps) => {
  const availableLookups = getAvailableLookups(record, chainId);

  return (
    <div className="h-12 flex items-center justify-start gap-1.5">
      {availableLookups.map((item) => (
        <a
          key={item.key}
          href={item.getLink(record, chainId)}
          target="_blank"
          rel="noopener noreferrer"
          title={item.label}
          className="w-6 h-6 flex items-center justify-center font-qs-medium bg-link text-sm text-white hover:bg-link-hover hover:text-white transition-all uppercase"
        >
          {item.key.slice(0, 1)}
        </a>
      ))}
    </div>
  );
};
