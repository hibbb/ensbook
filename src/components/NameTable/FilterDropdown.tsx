import { useState, useRef, useEffect, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

interface FilterDropdownProps {
  isActive: boolean; // 图标是否高亮
  children: ReactNode; // 下拉菜单的内容
  menuWidth?: string; // 可选宽度
}

export const FilterDropdown = ({
  isActive,
  children,
  menuWidth = "w-48",
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 通用的“点击外部关闭”逻辑
  useEffect(() => {
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
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 关闭菜单的辅助函数，传递给子元素使用（如果需要）
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
          isActive || isOpen
            ? "bg-blue-100 text-blue-600"
            : "text-gray-300 hover:bg-gray-200"
        }`}
      >
        <FontAwesomeIcon icon={faFilter} size="sm" />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-30 normal-case font-medium text-left overflow-hidden ${menuWidth}`}
          // 这里的 onClick 确保点击菜单项后自动关闭菜单（利用事件冒泡）
          onClick={closeMenu}
        >
          {children}
        </div>
      )}
    </div>
  );
};
