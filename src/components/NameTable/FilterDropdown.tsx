// src/components/NameTable/FilterDropdown.tsx

import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "../ui/Tooltip";

interface FilterDropdownProps {
  isActive: boolean;
  children: ReactNode;
  menuWidth?: string;
  title?: string;
  disabled?: boolean;
  // 🚀 新增: 支持对齐方式配置
  align?: "start" | "end";
}

export const FilterDropdown = ({
  isActive,
  children,
  menuWidth = "w-48",
  title = "筛选",
  disabled,
  align = "end", // 🚀 默认为 end (右对齐，保持原有行为)
}: FilterDropdownProps) => {
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
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      // 🚀 核心修改: 根据 align 计算 left 位置
      let left = 0;
      if (align === "end") {
        // 右对齐：基准点设在按钮右侧 (配合 translateX(-100%))
        left = rect.right;
      } else {
        // 左对齐：基准点设在按钮左侧
        left = rect.left;
      }

      setPosition({
        top: rect.bottom + 8,
        left: left,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Tooltip content={title}>
        <button
          type="button"
          onClick={toggleOpen}
          disabled={disabled}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150 ${
            disabled
              ? "text-gray-300 cursor-not-allowed"
              : isActive || isOpen
                ? "bg-link text-white"
                : "text-link hover:bg-gray-100"
          }`}
        >
          <FontAwesomeIcon icon={faFilter} size="xs" />
        </button>
      </Tooltip>

      {isOpen &&
        createPortal(
          <div
            className={`fixed bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in duration-150 ${menuWidth}`}
            style={{
              top: position.top,
              left: position.left,
              // 🚀 核心修改: 只有 end (右对齐) 时才需要向左平移自身宽度
              transform: align === "end" ? "translateX(-100%)" : "none",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsOpen(false)}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
};
