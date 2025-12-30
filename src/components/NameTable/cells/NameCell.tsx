import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import type { NameRecord } from "../../../types/ensNames";

interface NameCellProps {
  record: NameRecord;
}

export const NameCell = ({ record }: NameCellProps) => {
  return (
    <div className="h-12 flex items-center">
      <div
        className={`flex flex-col justify-center ${
          record.wrapped ? "px-1 border border-link/70 bg-link/5" : ""
        }`}
      >
        <a
          href={`https://app.ens.domains/${record.label}.eth`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 group/name"
          title="在 ENS 官网查看详情"
        >
          <span className="text-base font-qs-medium tracking-tight text-text-main">
            {record.label}
          </span>
          <span className="text-sm font-qs-regular text-gray-400">.eth</span>
          <FontAwesomeIcon
            icon={faUpRightFromSquare}
            className="text-[10px] text-link opacity-0 group-hover/name:opacity-100 transition-opacity duration-200"
          />
        </a>
      </div>
    </div>
  );
};
