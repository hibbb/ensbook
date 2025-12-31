// src/components/NameTable/headers/DeleteHeader.tsx

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
  // 🚀 新增：接收计数统计
  statusCounts?: Record<string, number>;
}

export const DeleteHeader = ({
  showDelete,
  onBatchDelete,
  uniqueStatuses = [],
  statusCounts = {}, // 默认空对象
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
          title="批量删除"
        >
          <FontAwesomeIcon icon={faTrash} size="sm" />
        </button>

        {/* 下拉菜单 */}
        {showDelete && onBatchDelete && (
          <div className="absolute right-0 top-full mt-2 w-40 text-sm font-qs-regular bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 opacity-0 invisible group-hover/delete:opacity-100 group-hover/delete:visible transition-all duration-200 transform origin-top-right">
            {/* 按状态删除 */}
            {uniqueStatuses.length > 0 && (
              <>
                {uniqueStatuses.map((status) => {
                  const count = statusCounts[status] || 0;
                  return (
                    <button
                      key={status}
                      onClick={() => onBatchDelete(status)}
                      className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between group/item ${STATUS_COLOR_TEXT[status]} ${STATUS_COLOR_BG_HOVER[status]}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{status}</span>
                        {/* 🚀 显示数量 */}
                        <span className="text-xs opacity-60 font-qs-regular">
                          ({count})
                        </span>
                      </div>
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                      />
                    </button>
                  );
                })}
                <div className="h-px bg-gray-100 my-1" />
              </>
            )}

            {/* 全部删除 */}
            <button
              onClick={() => onBatchDelete()}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-between group/clear"
            >
              <span>全部清空</span>
              <FontAwesomeIcon
                icon={faTrash}
                className="opacity-0 group-hover/clear:opacity-100 text-[10px]"
              />
            </button>
          </div>
        )}
      </div>
    </ThWrapper>
  );
};
