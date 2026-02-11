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
  closeOnOverlayClick?: boolean; // 是否允许点击遮罩关闭
  closeOnEsc?: boolean; // 是否允许按 ESC 关闭
}

export const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-sm",
  showCloseButton = true,
  zIndex = 100,
  // 默认值为 true，保持原有行为
  closeOnOverlayClick = true,
  closeOnEsc = true,
}: BaseModalProps) => {
  // 1. 滚动锁定
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // 2. 键盘交互 (ESC)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      // 增加判断：只有当 closeOnEsc 为 true 时才响应
      if (e.key === "Escape" && isOpen && closeOnEsc) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, closeOnEsc]); // 添加依赖

  if (typeof document === "undefined" || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 transition-all"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-text-main/20 backdrop-blur-sm animate-in fade-in duration-200"
        // 修改点击事件：只有允许点击关闭时才触发 onClose
        onClick={() => {
          if (closeOnOverlayClick) onClose();
        }}
        aria-hidden="true"
      />

      {/* 模态框容器 */}
      <div
        className={`
          relative w-full ${maxWidth} bg-white rounded-xl shadow-2xl overflow-hidden
          animate-in zoom-in-95 fade-in duration-200 border border-gray-100/50
          flex flex-col max-h-[90vh]
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0 bg-white z-10">
            <div className="text-lg font-sans font-semibold text-text-main flex items-center gap-2">
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

        {/* 内容区域 */}
        <div className="overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
