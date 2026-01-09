// src/components/NameTable/cells/NameCell.tsx

import { useMemo } from "react";
import { namehash, keccak256, stringToBytes } from "viem";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faFileLines } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next"; // 🚀

import type { NameRecord } from "../../../types/ensNames";
import { MemoEditor } from "../../MemoEditor";
import { Tooltip } from "../../ui/Tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/Popover";

interface NameCellProps {
  record: NameRecord;
  context: "home" | "collection";
}

const MetadataRow = ({
  label,
  value,
  fullValue,
}: {
  label: string;
  value: string;
  fullValue?: string;
}) => {
  const { t } = useTranslation(); // 🚀
  const handleCopy = () => {
    navigator.clipboard.writeText(fullValue || value);
    toast.success(t("table.cell.copy_success", { label }));
  };

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 font-qs-medium">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-gray-700">{value}</span>
        {fullValue && (
          <button
            onClick={handleCopy}
            className="text-gray-300 hover:text-link transition-colors p-1 rounded-md hover:bg-gray-50"
            title={t("table.cell.copy_full")}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        )}
      </div>
    </div>
  );
};

export const NameCell = ({ record }: NameCellProps) => {
  const { t } = useTranslation(); // 🚀

  const metadata = useMemo(() => {
    try {
      const fullName = `${record.label}.eth`;
      const labelHashHex = keccak256(stringToBytes(record.label));
      const nameHashHex = namehash(fullName);

      const labelHashDec = BigInt(labelHashHex).toString();
      const nameHashDec = BigInt(nameHashHex).toString();

      const truncate = (str: string, len = 6) =>
        `${str.slice(0, len)}...${str.slice(-4)}`;

      return {
        length: record.label.length,
        nameHashHex,
        nameHashDec,
        labelHashHex,
        labelHashDec,
        display: {
          nameHashHex: truncate(nameHashHex),
          nameHashDec: truncate(nameHashDec),
          labelHashHex: truncate(labelHashHex),
          labelHashDec: truncate(labelHashDec),
        },
      };
    } catch (e) {
      console.error("Hash calculation failed", e);
      return null;
    }
  }, [record.label]);

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(t("table.cell.copy_success", { label }));
  };

  const renderNameTooltip = () => {
    const fullName = `${record.label}.eth`;

    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-qs-semibold">
              {t("table.cell.label")}
            </span>
            <span className="font-qs-medium text-xs text-white">
              {record.label}
            </span>
          </div>
          <button
            onClick={(e) => handleCopy(e, record.label, t("table.cell.label"))}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title={t("table.cell.copy_label")}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-qs-semibold">
              {t("table.cell.name")}
            </span>
            <span className="font-qs-medium text-xs text-white">
              {fullName}
            </span>
          </div>
          <button
            onClick={(e) => handleCopy(e, fullName, t("table.cell.name"))}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title={t("table.cell.copy_name")}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>

        <div className="pt-2 pb-1 mt-1 border-t border-white/10 text-center">
          <span className="text-[10px] text-white font-qs-regular flex items-center justify-center gap-1">
            {t("table.cell.ens_app_link")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-12 flex items-center">
      <div className="flex items-center gap-2">
        <Tooltip content={renderNameTooltip()}>
          <a
            href={`https://app.ens.domains/${record.label}.eth`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 group"
          >
            {record.wrapped && (
              <span className="text-sm font-qs-regular text-link">{"["}</span>
            )}
            <span className="text-base font-qs-medium tracking-tight text-text-main transition-colors">
              {record.label}
            </span>
            <span className="text-sm font-qs-regular text-gray-400">.eth</span>
            {record.wrapped && (
              <span className="text-sm font-qs-regular text-link">{"]"}</span>
            )}
          </a>
        </Tooltip>

        {metadata && (
          <Popover>
            <Tooltip content={t("table.cell.meta_tooltip")}>
              <PopoverTrigger asChild>
                <button className="text-gray-300 hover:text-link transition-colors outline-none">
                  <FontAwesomeIcon icon={faFileLines} size="xs" />
                </button>
              </PopoverTrigger>
            </Tooltip>

            <PopoverContent className="w-80 p-0 overflow-hidden" align="start">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-qs-semibold text-gray-500 uppercase tracking-wider">
                  {t("table.cell.meta_title")}
                </span>
                <span className="text-xs font-qs-medium text-gray-400">
                  {record.label}.eth
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-qs-medium">
                    {t("table.cell.length")}:
                  </span>
                  <span className="font-qs-semibold text-gray-700">
                    {metadata.length}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-qs-medium">
                    {t("table.cell.state")}:
                  </span>
                  {record.wrapped ? (
                    <div className="flex items-center font-qs-semibold gap-2">
                      <span className="text-sm text-link">{"["}</span>
                      {t("table.filter.wrapped")}
                      <span className="text-sm text-link">{"]"}</span>
                    </div>
                  ) : (
                    t("table.filter.unwrapped")
                  )}
                </div>

                <MetadataRow
                  label="Namehash (Hex)"
                  value={metadata.display.nameHashHex}
                  fullValue={metadata.nameHashHex}
                />
                <MetadataRow
                  label="Namehash (Dec)"
                  value={metadata.display.nameHashDec}
                  fullValue={metadata.nameHashDec}
                />
                <MetadataRow
                  label="Labelhash (Hex)"
                  value={metadata.display.labelHashHex}
                  fullValue={metadata.labelHashHex}
                />
                <MetadataRow
                  label="Labelhash (Dec)"
                  value={metadata.display.labelHashDec}
                  fullValue={metadata.labelHashDec}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}

        <MemoEditor label={record.label} />
      </div>
    </div>
  );
};
