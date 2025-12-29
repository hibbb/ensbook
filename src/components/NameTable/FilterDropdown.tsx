// src/components/NameTable/FilterDropdown.tsx
import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom"; // 🚀 引入 createPortal
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

interface FilterDropdownProps {
  isActive: boolean;
  children: ReactNode;
  menuWidth?: string;
}

export const FilterDropdown = ({
  isActive,
  children,
  menuWidth = "w-48",
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🚀 新增：用于存储计算后的菜单位置
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // 滚动时关闭下拉，避免位置错位（简单处理）
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // 如果点击的是 Portal 内的元素，这里可能无法检测到包含关系
        // 但由于 Portal 渲染在 body，通常点击外部会触发这里的逻辑
        // 我们需要额外判断点击是否在 Portal 容器内，或者简化逻辑：
        // 这里的 containerRef 仅包含按钮，点击菜单区域会触发 document click。
        // 为了防止菜单一点击就关闭，我们需要阻止菜单内的冒泡，见下方 Portal 内容。
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

  // 🚀 计算位置并打开
  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // 计算位置：按钮底部 + 滚动偏移
      // 这里使用 fixed 定位，所以不需要加 scrollY，直接用 clientRect
      setPosition({
        top: rect.bottom + 8, // 8px gap
        // 简单的右对齐逻辑 (如果 menuWidth 改变可能需要更复杂的计算，这里简单处理)
        left: rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
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

      {/* 🚀 使用 Portal 渲染菜单到 body，彻底解决 overflow 问题 */}
      {isOpen &&
        createPortal(
          <div
            // 使用 fixed 定位，z-index 设高
            className={`fixed bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in duration-150 ${menuWidth}`}
            style={{
              top: position.top,
              // 因为是右对齐，我们用 left 设置位置，然后通过 CSS 调整
              // 注意：menuWidth 通常是 w-32 (8rem/128px)，我们需要向左偏移
              left: position.left,
              transform: "translateX(-100%)", // 实现右对齐效果
            }}
            // 阻止点击菜单时触发外部点击关闭
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
