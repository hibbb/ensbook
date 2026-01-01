// src/components/MemoEditor.tsx

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faComment, faCheck } from "@fortawesome/free-solid-svg-icons";
import { getMemo, setMemo } from "../services/storage/memos";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover"; // 🚀 引入新组件
import { Tooltip } from "./ui/Tooltip"; // 🚀 复用 Tooltip 显示简单提示
import toast from "react-hot-toast";

interface MemoEditorProps {
  label: string;
}

export const MemoEditor = ({ label }: MemoEditorProps) => {
  const [memo, setLocalMemo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState("");

  // 初始化读取
  useEffect(() => {
    setLocalMemo(getMemo(label));
  }, [label]);

  const hasMemo = !!memo;

  // 打开时同步数据
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditValue(memo);
    }
    setIsOpen(open);
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
    // Popover 自带 ESC 关闭功能，这里不需要额外写
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      {/* 这里巧妙地组合了：
        1. Tooltip: 鼠标悬停显示 "添加备注" 或当前备注内容
        2. Popover: 鼠标点击打开编辑框
      */}
      <Tooltip content={hasMemo ? memo : "添加备注"}>
        <PopoverTrigger asChild>
          <button
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 outline-none ml-1
              ${
                isOpen // 打开状态保持高亮
                  ? "bg-blue-100 text-link"
                  : hasMemo
                    ? "text-link hover:text-link-hover bg-blue-50/50 hover:bg-blue-100/50"
                    : "text-gray-300 hover:text-text-main hover:bg-gray-100"
              }
            `}
          >
            <FontAwesomeIcon
              icon={hasMemo ? faComment : faPenToSquare}
              size="xs"
              className={hasMemo ? "text-sm" : "text-xs"}
            />
          </button>
        </PopoverTrigger>
      </Tooltip>

      <PopoverContent align="start" side="bottom" className="w-64 p-3">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-xs font-qs-bold text-gray-400">编辑备注</span>
          <span className="text-[10px] text-gray-300">Ctrl+Enter 保存</span>
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
      </PopoverContent>
    </Popover>
  );
};
