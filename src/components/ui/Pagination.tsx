// src/components/ui/Pagination.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    // 🚀 修复：真正使用 maxVisible 来控制显示数量
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2); // 2

    let start = currentPage - half;
    let end = currentPage + half;

    // 1. 处理头部越界：如果 start < 1，固定从 1 开始，并向后延伸窗口
    if (start < 1) {
      start = 1;
      end = Math.min(totalPages, start + maxVisible - 1);
    }

    // 2. 处理尾部越界：如果 end > totalPages，固定在末页，并向前延伸窗口
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const btnClass =
    "w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors outline-none focus:ring-2 focus:ring-link/20";
  const activeClass =
    "bg-link text-white font-qs-bold shadow-md shadow-link/20";
  const inactiveClass = "text-gray-500 hover:bg-gray-100 hover:text-text-main";
  const disabledClass = "text-gray-300 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-2 py-6 select-none border-t border-gray-100 bg-white rounded-b-xl">
      {/* 首页 */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`${btnClass} ${currentPage === 1 ? disabledClass : inactiveClass}`}
        title="首页"
      >
        <FontAwesomeIcon icon={faAnglesLeft} size="xs" />
      </button>

      {/* 上一页 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnClass} ${currentPage === 1 ? disabledClass : inactiveClass}`}
        title="上一页"
      >
        <FontAwesomeIcon icon={faChevronLeft} size="xs" />
      </button>

      {/* 页码 */}
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${btnClass} ${currentPage === page ? activeClass : inactiveClass}`}
        >
          {page}
        </button>
      ))}

      {/* 下一页 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnClass} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
        title="下一页"
      >
        <FontAwesomeIcon icon={faChevronRight} size="xs" />
      </button>

      {/* 末页 */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`${btnClass} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
        title="末页"
      >
        <FontAwesomeIcon icon={faAnglesRight} size="xs" />
      </button>

      {/* 统计信息 */}
      <span className="text-xs text-gray-400 ml-4 font-qs-medium">
        共 {totalCount} 条 / {totalPages} 页
      </span>
    </div>
  );
};
