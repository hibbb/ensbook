// src/components/ui/BaseModal.tsx

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?:
    | "max-w-sm"
    | "max-w-md"
    | "max-w-lg"
    | "max-w-xl"
    | "max-w-2xl"
    | "max-w-3xl"
    | "max-w-4xl";
  showCloseButton?: boolean;
  zIndex?: number;
}

export const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-sm",
  showCloseButton = true,
  zIndex = 100,
}: BaseModalProps) => {
  // 1. 滚动锁定 (Scroll Lock)
  // 当模态框打开时，禁止背景页面滚动；关闭时恢复
  useEffect(() => {
    if (isOpen) {
      // 记录当前的 overflow 状态，防止覆盖原有的 style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // 2. 键盘交互 (A11y)
  // 监听 ESC 键关闭模态框
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // 3. 安全性与环境检查
  // 如果在服务端 (document undefined) 或模态框未打开，直接返回 null
  // 这避免了 "document is not defined" 错误，也消除了 useEffect setState 导致的级联渲染
  if (typeof document === "undefined" || !isOpen) return null;

  // 使用 Portal 渲染到 body，确保层级正确，不受父级 overflow:hidden 影响
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 transition-all"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 模态框容器 */}
      {/* 添加 max-h 和 flex 布局，确保内容过多时头部固定，内部滚动 */}
      <div
        className={`
          relative w-full ${maxWidth} bg-white rounded-xl shadow-2xl overflow-hidden
          animate-in zoom-in-95 fade-in duration-200 border border-gray-100/50
          flex flex-col max-h-[90vh]
        `}
        onClick={(e) => e.stopPropagation()} // 防止点击内部触发背景关闭
      >
        {/* 头部 (仅当提供了 title 或 showCloseButton 时渲染) */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0 bg-white z-10">
            <div className="text-lg font-qs-semibold text-text-main flex items-center gap-2">
              {title}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-50 outline-none focus:ring-2 focus:ring-gray-200"
                aria-label="Close modal"
              >
                <FontAwesomeIcon icon={faXmark} size="lg" />
              </button>
            )}
          </div>
        )}

        {/* 内容区域 (支持内部滚动) */}
        <div className="overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
