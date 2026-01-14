// src/components/NameTable/cells/OwnerCell.tsx

import toast from "react-hot-toast";
import { Link } from "react-router-dom"; // 🚀 引入 Link
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import type { NameRecord } from "../../../types/ensNames";
import { Tooltip } from "../../ui/Tooltip";
import { truncateAddress } from "../../../utils/format";

interface OwnerCellProps {
  record: NameRecord;
}

export const OwnerCell = ({ record }: OwnerCellProps) => {
  const { t } = useTranslation();

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.preventDefault(); // 防止触发 Link 跳转
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(t("common.copy_success", { label }));
  };

  const renderTooltipContent = () => {
    if (!record.owner) return null;

    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        {/* 所有者地址 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-qs-semibold">
              {t("table.cell.owner_addr")}
            </span>
            <span className="font-qs-medium text-xs">
              {truncateAddress(record.owner)}
            </span>
          </div>
          <button
            onClick={(e) =>
              handleCopy(e, record.owner!, t("table.cell.owner_addr"))
            }
            className="text-gray-400 hover:text-white transition-colors p-1"
            title={t("table.cell.copy_addr")}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>

        {/* 主名称 (如果有) */}
        {record.ownerPrimaryName && (
          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-qs-semibold">
                {t("table.cell.primary_name")}
              </span>
              <span className="font-qs-medium text-xs">
                {record.ownerPrimaryName}
              </span>
            </div>
            <button
              onClick={(e) =>
                handleCopy(
                  e,
                  record.ownerPrimaryName!,
                  t("table.cell.primary_name"),
                )
              }
              className="text-gray-400 hover:text-white transition-colors p-1"
              title={t("table.cell.copy_primary")}
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        )}

        {/* 🚀 底部提示：点击查看持仓 */}
        <div className="pt-2 pb-1 border-t border-white/10 text-center">
          <span className="text-[10px] text-white font-qs-regular flex items-center justify-center gap-1">
            {t("table.cell.view_portfolio")}
          </span>
        </div>
      </div>
    );
  };

  // 🚀 优先使用 ENS 名称作为链接参数
  const linkTarget = record.ownerPrimaryName || record.owner;

  return (
    <div className="h-12 flex items-center">
      {record.owner ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Tooltip content={renderTooltipContent()}>
            <Link
              to={`/account/${linkTarget}`}
              className={`
                transition-colors duration-200
                hover:underline decoration-text-main/30 underline-offset-2
                ${record.ownerPrimaryName ? "text-text-main hover:text-text-main" : "text-text-main/50  hover:text-text-main/70"}
              `}
            >
              {record.ownerPrimaryName || truncateAddress(record.owner)}
            </Link>
          </Tooltip>
        </div>
      ) : (
        <span className="text-gray-300 text-xs">—</span>
      )}
    </div>
  );
};
