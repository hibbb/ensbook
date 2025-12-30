import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { ThWrapper } from "./ThWrapper";
import {
  STATUS_COLOR_BG_HOVER,
  STATUS_COLOR_TEXT,
} from "../../../config/constants";

interface DeleteHeaderProps {
  showDelete?: boolean;
  onBatchDelete?: (status?: string) => void;
  uniqueStatuses?: string[];
}

export const DeleteHeader = ({
  showDelete,
  onBatchDelete,
  uniqueStatuses = [],
}: DeleteHeaderProps) => {
  return (
    <ThWrapper className="justify-center">
      <div className={`relative ${showDelete ? "group/delete" : ""}`}>
        {/* 触发器 */}
        <button
          disabled={!showDelete}
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 ${
            showDelete
              ? "text-link hover:bg-gray-50 cursor-pointer"
              : "text-gray-300 cursor-not-allowed opacity-50"
          }`}
        >
          <FontAwesomeIcon icon={faTrash} size="sm" />
        </button>

        {/* 下拉菜单 */}
        {showDelete && onBatchDelete && (
          <div className="absolute right-0 top-full mt-2 w-32 text-sm font-qs-regular bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 opacity-0 invisible group-hover/delete:opacity-100 group-hover/delete:visible transition-all duration-200 transform origin-top-right">
            {/* 按状态删除 */}
            {uniqueStatuses.length > 0 && (
              <>
                {uniqueStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => onBatchDelete(status)}
                    className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between group/item ${STATUS_COLOR_TEXT[status]} ${STATUS_COLOR_BG_HOVER[status]}`}
                  >
                    <span>{status}</span>
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                    />
                  </button>
                ))}
                <div className="h-px bg-gray-100 my-1" />
              </>
            )}

            {/* 全部删除 */}
            <button
              onClick={() => onBatchDelete()}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <span>全部清空</span>
            </button>
          </div>
        )}
      </div>
    </ThWrapper>
  );
};
