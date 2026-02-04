// src/components/NameTable/headers/ControlHeader.tsx

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { ThWrapper } from "./ThWrapper";
import type { DeleteCriteria } from "../types";
import { Tooltip } from "../../ui/Tooltip";

interface ControlHeaderProps {
  // 模式 A: 批量删除 (Home / Mine)
  onBatchDelete?: (criteria: DeleteCriteria) => void;

  // 模式 B: 添加到首页 (Collection / Account)
  onAddToHome?: boolean; // 这里只需要知道是否存在这个意图，不需要传函数

  // 统计数据 (用于批量删除菜单)
  uniqueStatuses?: string[];
  statusCounts?: Record<string, number>;
  nameCounts?: {
    lengthCounts: Record<number, number>;
    availableLengths: number[];
    wrappedCounts: { all: number; wrapped: number; unwrapped: number };
  };
  ownershipCounts?: { mine: number; others: number };
}

export const ControlHeader = ({
  onBatchDelete,
  onAddToHome,
  uniqueStatuses = [],
  statusCounts = {},
  nameCounts = {
    lengthCounts: {},
    availableLengths: [],
    wrappedCounts: { all: 0, wrapped: 0, unwrapped: 0 },
  },
  ownershipCounts = { mine: 0, others: 0 },
}: ControlHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { t } = useTranslation();

  // --- 模式 B: 仅显示添加图标 (静态表头) ---
  if (!onBatchDelete && onAddToHome) {
    return (
      <ThWrapper className="justify-center">
        <div className="w-6 h-6 flex items-center justify-center text-gray-300 select-none">
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </div>
      </ThWrapper>
    );
  }

  // --- 如果没有任何操作，返回 null ---
  if (!onBatchDelete) {
    return null;
  }

  // --- 模式 A: 批量删除逻辑 (原 DeleteHeader 逻辑) ---

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (!isOpen) return;
      if (
        menuRef.current &&
        event.target instanceof Node &&
        menuRef.current.contains(event.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        containerRef.current.contains(e.target as Node)
      ) {
        return;
      }
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
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

  const handleItemClick = (criteria: DeleteCriteria) => {
    onBatchDelete(criteria);
    setIsOpen(false);
  };

  const activeStatuses = uniqueStatuses.filter(
    (s) => (statusCounts[s] || 0) > 0,
  );
  const activeLengths = nameCounts.availableLengths.filter(
    (len) => (nameCounts.lengthCounts[len] || 0) > 0,
  );
  const hasWrapped = nameCounts.wrappedCounts.wrapped > 0;
  const hasUnwrapped = nameCounts.wrappedCounts.unwrapped > 0;
  const activeWrappedCount = (hasWrapped ? 1 : 0) + (hasUnwrapped ? 1 : 0);
  const hasMine = ownershipCounts.mine > 0;
  const hasOthers = ownershipCounts.others > 0;
  const activeOwnerCount = (hasMine ? 1 : 0) + (hasOthers ? 1 : 0);

  return (
    <ThWrapper className="justify-center">
      <div className="relative inline-block" ref={containerRef}>
        <Tooltip content={t("table.delete.tooltip")}>
          <button
            onClick={toggleOpen}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 ${
              isOpen
                ? "bg-red-500 text-white"
                : "text-red-400 hover:text-red-500 hover:bg-gray-50 cursor-pointer"
            }`}
          >
            <FontAwesomeIcon icon={faTrash} size="sm" />
          </button>
        </Tooltip>

        {isOpen &&
          createPortal(
            <div
              ref={menuRef}
              className="fixed text-sm bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in duration-150 w-48 origin-top-right overflow-y-auto custom-scrollbar max-h-[60vh]"
              style={{
                top: position.top,
                left: position.left,
                transform: "translateX(-100%)",
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div>
                {activeStatuses.length > 1 && (
                  <>
                    <div className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {t("table.delete.by_status")}
                    </div>
                    {activeStatuses.map((status) => {
                      const count = statusCounts[status] || 0;
                      return (
                        <button
                          key={status}
                          onClick={() =>
                            handleItemClick({ type: "status", value: status })
                          }
                          className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-between group/item"
                        >
                          <span>{t(`status.${status.toLowerCase()}`)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-60 font-sans font-regular">
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
                {activeLengths.length > 1 && (
                  <>
                    <div className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {t("table.delete.by_length")}
                    </div>
                    {activeLengths.map((len) => {
                      const count = nameCounts.lengthCounts[len] || 0;
                      return (
                        <button
                          key={len}
                          onClick={() =>
                            handleItemClick({ type: "length", value: len })
                          }
                          className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-between group/item"
                        >
                          <span>
                            {len} {t("table.filter.char")}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-60 font-sans font-regular">
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
                {activeWrappedCount > 1 && (
                  <>
                    <div className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {t("table.delete.by_wrap")}
                    </div>
                    {hasWrapped && (
                      <button
                        onClick={() =>
                          handleItemClick({ type: "wrapped", value: true })
                        }
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-between group/item"
                      >
                        <span>{t("table.filter.wrapped")}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-60 font-sans font-regular">
                            ({nameCounts.wrappedCounts.wrapped})
                          </span>
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                          />
                        </div>
                      </button>
                    )}
                    {hasUnwrapped && (
                      <button
                        onClick={() =>
                          handleItemClick({ type: "wrapped", value: false })
                        }
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-between group/item"
                      >
                        <span>{t("table.filter.unwrapped")}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-60 font-sans font-regular">
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
                {activeOwnerCount > 1 && (
                  <>
                    <div className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {t("table.delete.by_owner")}
                    </div>
                    <button
                      onClick={() =>
                        handleItemClick({ type: "owner", value: "mine" })
                      }
                      className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-between group/item"
                    >
                      <div className="flex items-center gap-2">
                        <span>{t("table.delete.connected_wallet")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-60 font-sans font-regular">
                          ({ownershipCounts.mine})
                        </span>
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                        />
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleItemClick({ type: "owner", value: "others" })
                      }
                      className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-between group/item"
                    >
                      <span>{t("table.delete.others")}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-60 font-sans font-regular">
                          ({ownershipCounts.others})
                        </span>
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="opacity-0 group-hover/item:opacity-100 text-[10px]"
                        />
                      </div>
                    </button>
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                  </>
                )}
                <button
                  onClick={() => handleItemClick({ type: "all" })}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-between group/clear font-medium"
                >
                  <span>{t("table.delete.clear_all")}</span>
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
