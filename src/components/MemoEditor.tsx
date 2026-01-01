// src/components/MemoEditor.tsx

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faComment, faCheck } from "@fortawesome/free-solid-svg-icons";
import { getMemo, setMemo } from "../services/storage/memos";
import toast from "react-hot-toast";

interface MemoEditorProps {
  label: string;
}

export const MemoEditor = ({ label }: MemoEditorProps) => {
  const [memo, setLocalMemo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState("");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // 初始化读取
  useEffect(() => {
    setLocalMemo(getMemo(label));
  }, [label]);

  const hasMemo = !!memo;

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 计算位置
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left - 10, // 稍微向左偏移一点，对齐视觉
      });
    }

    setEditValue(memo);
    setIsOpen(true);
  };

  const handleSave = () => {
    setMemo(label, editValue);
    setLocalMemo(editValue.trim());
    setIsOpen(false);
    toast.success(editValue.trim() ? "备注已更新" : "备注已删除");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 outline-none ml-1
          ${
            hasMemo
              ? "text-link hover:text-link-hover bg-blue-50/50 hover:bg-blue-100/50"
              : "text-gray-300 hover:text-text-main hover:bg-gray-100"
          }
        `}
        title={hasMemo ? memo : "添加备注"}
      >
        <FontAwesomeIcon
          icon={hasMemo ? faComment : faPenToSquare}
          size="xs"
          className={hasMemo ? "text-sm" : "text-xs"}
        />
      </button>

      {/* 使用 Portal 渲染气泡卡片 */}
      {isOpen &&
        createPortal(
          <>
            {/* 透明遮罩：点击外部关闭 */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* 编辑框主体 */}
            <div
              className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 w-64 p-3 animate-in fade-in zoom-in-95 duration-150 origin-top-left"
              style={{ top: position.top, left: position.left }}
              onClick={(e) => e.stopPropagation()} // 防止点击内部触发关闭
            >
              <div className="mb-2 flex justify-between items-center">
                <span className="text-xs font-qs-bold text-gray-400">
                  编辑备注
                </span>
                <span className="text-[10px] text-gray-300">
                  Ctrl+Enter 保存
                </span>
              </div>

              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入备注信息..."
                className="w-full h-24 p-2 text-sm text-text-main bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-link/20 focus:border-link resize-none font-qs-medium"
                maxLength={200}
              />

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-link text-white text-xs font-bold py-1.5 rounded-lg hover:bg-link-hover active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <FontAwesomeIcon icon={faCheck} /> 保存
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 bg-gray-100 text-gray-500 text-xs font-bold py-1.5 rounded-lg hover:bg-gray-200 hover:text-gray-700 active:scale-95 transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};
