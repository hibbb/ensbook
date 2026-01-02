// src/components/NameTable/FilterDropdown.tsx
import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "../ui/Tooltip"; // 🚀 引入 Tooltip

interface FilterDropdownProps {
  isActive: boolean;
  children: ReactNode;
  menuWidth?: string;
  title?: string; // 🚀 新增 title 属性
}

export const FilterDropdown = ({
  isActive,
  children,
  menuWidth = "w-48",
  title = "筛选", // 🚀 默认值
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
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* 🚀 使用 Tooltip 包裹按钮 */}
      <Tooltip content={title}>
        <button
          type="button"
          onClick={toggleOpen}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150 ${
            isActive || isOpen
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
              transform: "translateX(-100%)",
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
