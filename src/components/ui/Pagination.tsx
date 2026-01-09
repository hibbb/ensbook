// src/components/ui/Pagination.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next"; // 🚀

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
  const { t } = useTranslation(); // 🚀

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = Math.min(totalPages, start + maxVisible - 1);
    }

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
    "bg-link text-white font-qs-semibold shadow-md shadow-link/20";
  const inactiveClass = "text-gray-500 hover:bg-gray-100 hover:text-text-main";
  const disabledClass = "text-gray-300 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-2 py-6 select-none border-t border-gray-100 bg-white rounded-b-xl">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`${btnClass} ${currentPage === 1 ? disabledClass : inactiveClass}`}
        title={t("pagination.first")}
      >
        <FontAwesomeIcon icon={faAnglesLeft} size="xs" />
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnClass} ${currentPage === 1 ? disabledClass : inactiveClass}`}
        title={t("pagination.prev")}
      >
        <FontAwesomeIcon icon={faChevronLeft} size="xs" />
      </button>

      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${btnClass} ${currentPage === page ? activeClass : inactiveClass}`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnClass} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
        title={t("pagination.next")}
      >
        <FontAwesomeIcon icon={faChevronRight} size="xs" />
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`${btnClass} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
        title={t("pagination.last")}
      >
        <FontAwesomeIcon icon={faAnglesRight} size="xs" />
      </button>

      <span className="text-xs text-gray-400 ml-4 font-qs-medium">
        {t("pagination.info", { total: totalCount, pages: totalPages })}
      </span>
    </div>
  );
};
