// src/components/NameTable/FilterDropdown.tsx

import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../ui/Tooltip";

interface FilterDropdownProps {
  isActive: boolean;
  children: ReactNode;
  menuWidth?: string;
  title?: string;
  disabled?: boolean;
  align?: "start" | "end";
}

export const FilterDropdown = ({
  isActive,
  children,
  menuWidth = "w-48",
  title,
  disabled,
  align = "end",
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ref 1: 触发按钮的引用
  const triggerRef = useRef<HTMLDivElement>(null);
  // Ref 2: 下拉菜单内容的引用
  const menuRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { t } = useTranslation();

  const displayTitle = title || t("table.filter.default_title");

  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (!isOpen) return;

      // 🚀 修复滚动问题：
      // 如果滚动的事件源(target)包含在菜单内部，说明用户正在滚动列表，不应该关闭菜单
      if (
        menuRef.current &&
        event.target instanceof Node &&
        menuRef.current.contains(event.target)
      ) {
        return;
      }

      // 如果是页面背景滚动，则关闭菜单（保持定位准确）
      setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      // 🚀 UX 优化：点击外部关闭
      // 如果点击发生在 触发按钮内 OR 菜单内容内，都不关闭
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) {
        return;
      }
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }

      // 只有真正点击了外部区域，才关闭
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // 第三个参数 true (Capture phase) 确保能捕获到滚动事件
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let left = 0;
      if (align === "end") {
        left = rect.right;
      } else {
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
    <div className="relative inline-block" ref={triggerRef}>
      <Tooltip content={disabled ? "" : displayTitle}>
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
            ref={menuRef} // 🚀 绑定 Ref 到菜单容器
            className={`
              fixed bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl py-2 z-[9999]
              animate-in fade-in zoom-in duration-150
              max-h-[60vh] overflow-y-auto custom-scrollbar
              ${menuWidth}
            `}
            style={{
              top: position.top,
              left: position.left,
              transform: align === "end" ? "translateX(-100%)" : "none",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            // 🚀 UX 优化：移除了外层的 onClick={() => setIsOpen(false)}
            // 这样点击内部选项时，事件冒泡到这里不会触发关闭
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
};
