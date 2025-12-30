import type { NameRecord } from "../../../types/ensNames";

interface OwnerCellProps {
  record: NameRecord;
  currentAddress?: string;
}

export const OwnerCell = ({ record, currentAddress }: OwnerCellProps) => {
  const isMe =
    currentAddress &&
    record.owner?.toLowerCase() === currentAddress.toLowerCase();

  return (
    <div className="h-12 flex items-center">
      {record.owner ? (
        <div
          className={`flex items-center gap-2 text-sm ${isMe ? "" : "text-text-main"}`}
        >
          <span
            title={record.owner}
            className={record.ownerPrimaryName ? "" : "text-gray-400"}
          >
            {record.ownerPrimaryName ||
              `${record.owner.slice(0, 6)}...${record.owner.slice(-4)}`}
          </span>
          {isMe && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-link opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-link"></span>
            </span>
          )}
        </div>
      ) : (
        <span className="text-gray-300 text-xs">—</span>
      )}
    </div>
  );
};
