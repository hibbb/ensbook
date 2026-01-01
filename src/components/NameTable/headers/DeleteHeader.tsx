// src/components/NameTable/headers/DeleteHeader.tsx

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { ThWrapper } from "./ThWrapper";
import { STATUS_COLOR_TEXT } from "../../../config/constants";
import type { DeleteCriteria } from "../types";

interface DeleteHeaderProps {
  showDelete?: boolean;
  onBatchDelete?: (criteria: DeleteCriteria) => void;
  uniqueStatuses?: string[];
  statusCounts?: Record<string, number>;
  nameCounts?: {
    lengthCounts: Record<number, number>;
    availableLengths: number[];
    wrappedCounts: { all: number; wrapped: number; unwrapped: number };
  };
}

export const DeleteHeader = ({
  showDelete,
  onBatchDelete,
  uniqueStatuses = [],
  statusCounts = {},
  nameCounts = {
    lengthCounts: {},
    availableLengths: [],
    wrappedCounts: { all: 0, wrapped: 0, unwrapped: 0 },
  },
}: DeleteHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (!showDelete) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = (criteria: DeleteCriteria) => {
    onBatchDelete?.(criteria);
    setIsOpen(false);
  };

  const hasDeletableLengths = nameCounts.availableLengths.some(
    (len) => (nameCounts.lengthCounts[len] || 0) > 0,
  );
  const hasDeletableWrapped =
    nameCounts.wrappedCounts.wrapped > 0 ||
    nameCounts.wrappedCounts.unwrapped > 0;

  return (
    <ThWrapper className="justify-center">
      <div className="relative inline-block" ref={containerRef}>
        <button
          disabled={!showDelete}
          onClick={toggleOpen}
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 ${
            showDelete
              ? isOpen
                ? "bg-red-500 text-white"
                : "text-red-400 hover:text-red-500 hover:bg-gray-50 cursor-pointer"
              : "text-gray-200 cursor-not-allowed"
          }`}
          title="批量删除"
        >
          <FontAwesomeIcon icon={faTrash} size="sm" />
        </button>

        {isOpen &&
          showDelete &&
          onBatchDelete &&
          createPortal(
            <div
              className="fixed text-sm bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in duration-150 w-48 origin-top-right overflow-hidden"
              style={{
                top: position.top,
                left: position.left,
                transform: "translateX(-100%)",
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="max-h-[60vh] overflow-y-auto">
                {/* 1. 按状态删除 */}
                {uniqueStatuses.length > 0 && (
                  <>
                    <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      按状态
                    </div>
                    {uniqueStatuses.map((status) => {
                      const count = statusCounts[status] || 0;
                      if (count === 0) return null;

                      return (
                        <button
                          key={status}
                          onClick={() =>
                            handleItemClick({ type: "status", value: status })
                          }
                          // 🚀 更新 Hover 颜色
                          className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between group/item hover:bg-gray-200 ${STATUS_COLOR_TEXT[status]}`}
                        >
                          <span>{status}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-60 font-qs-regular">
                              ({count})
                            </span>
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                            />
                          </div>
                        </button>
                      );
                    })}
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                  </>
                )}

                {/* 2. 按长度删除 */}
                {hasDeletableLengths && (
                  <>
                    <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      按长度
                    </div>
                    {nameCounts.availableLengths.map((len) => {
                      const count = nameCounts.lengthCounts[len] || 0;
                      if (count === 0) return null;

                      return (
                        <button
                          key={len}
                          onClick={() =>
                            handleItemClick({ type: "length", value: len })
                          }
                          // 🚀 更新 Hover 颜色
                          className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-between group/item"
                        >
                          <span>{len} 字符</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-60 font-qs-regular">
                              ({count})
                            </span>
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                            />
                          </div>
                        </button>
                      );
                    })}
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                  </>
                )}

                {/* 3. 按包装状态删除 */}
                {hasDeletableWrapped && (
                  <>
                    <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      按包装
                    </div>
                    {nameCounts.wrappedCounts.wrapped > 0 && (
                      <button
                        onClick={() =>
                          handleItemClick({ type: "wrapped", value: true })
                        }
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-between group/item"
                      >
                        <span>Wrapped</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-60 font-qs-regular">
                            ({nameCounts.wrappedCounts.wrapped})
                          </span>
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                          />
                        </div>
                      </button>
                    )}
                    {nameCounts.wrappedCounts.unwrapped > 0 && (
                      <button
                        onClick={() =>
                          handleItemClick({ type: "wrapped", value: false })
                        }
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-between group/item"
                      >
                        <span>Unwrapped</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-60 font-qs-regular">
                            ({nameCounts.wrappedCounts.unwrapped})
                          </span>
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                          />
                        </div>
                      </button>
                    )}
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                  </>
                )}

                {/* 4. 全部删除 */}
                <button
                  onClick={() => handleItemClick({ type: "all" })}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-between group/clear font-medium"
                >
                  <span>全部清空</span>
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="opacity-0 group-hover/clear:opacity-100 text-[10px]"
                  />
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </ThWrapper>
  );
};
