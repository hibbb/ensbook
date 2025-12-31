// src/components/NameTable/headers/DeleteHeader.tsx

import { useState, useRef, useEffect } from "react"; // 🚀 引入 hooks
import { createPortal } from "react-dom"; // 🚀 引入 Portal (与 FilterDropdown 保持一致，防止被遮挡)
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
  statusCounts?: Record<string, number>;
}

export const DeleteHeader = ({
  showDelete,
  onBatchDelete,
  uniqueStatuses = [],
  statusCounts = {},
}: DeleteHeaderProps) => {
  // 🚀 1. 状态管理：改为点击触发
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // 🚀 2. 点击外部关闭逻辑 (保持交互的一致性)
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

  // 🚀 3. 切换显示并计算位置
  const toggleOpen = () => {
    if (!showDelete) return;

    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.right, // 右对齐
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <ThWrapper className="justify-center">
      <div className="relative inline-block" ref={containerRef}>
        {/* 触发器按钮 */}
        <button
          disabled={!showDelete}
          onClick={toggleOpen} // 🚀 改为 onClick
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 ${
            showDelete
              ? isOpen // 激活状态样式
                ? "bg-link text-white"
                : "text-link hover:bg-gray-100 cursor-pointer"
              : "text-gray-300 cursor-not-allowed"
          }`}
          title="批量删除"
        >
          <FontAwesomeIcon icon={faTrash} size="sm" />
        </button>

        {/* 下拉菜单 - 使用 Portal 渲染 (与 FilterDropdown 保持一致) */}
        {isOpen &&
          showDelete &&
          onBatchDelete &&
          createPortal(
            <div
              className="fixed text-sm bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in duration-150 w-40 origin-top-right"
              style={{
                top: position.top,
                left: position.left,
                transform: "translateX(-100%)", // 实现右对齐
              }}
              onMouseDown={(e) => e.stopPropagation()} // 防止点击菜单内部触发关闭
            >
              {/* 按状态删除 */}
              {uniqueStatuses.length > 0 && (
                <>
                  {uniqueStatuses.map((status) => {
                    const count = statusCounts[status] || 0;
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          onBatchDelete(status);
                          setIsOpen(false); // 点击后关闭
                        }}
                        className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between group/item ${STATUS_COLOR_TEXT[status]} ${STATUS_COLOR_BG_HOVER[status]}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{status}</span>
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
                onClick={() => {
                  onBatchDelete();
                  setIsOpen(false); // 点击后关闭
                }}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-between group/clear"
              >
                <span>全部清空</span>
                <FontAwesomeIcon
                  icon={faTrash}
                  className="opacity-0 group-hover/clear:opacity-100 text-[10px]"
                />
              </button>
            </div>,
            document.body,
          )}
      </div>
    </ThWrapper>
  );
};
