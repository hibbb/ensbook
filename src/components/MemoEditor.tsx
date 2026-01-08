// src/components/MemoEditor.tsx

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCommentDots,
} from "@fortawesome/free-regular-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// 🚀 引入新的存储方法
import { getDomainMeta, updateDomainMeta } from "../services/storage/userStore";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover";
import { Tooltip } from "./ui/Tooltip";
import type { NameRecord } from "../types/ensNames";

const MAX_MEMO_LENGTH = 200;

interface MemoEditorProps {
  label: string;
  // 🚀 移除 context prop
}

export const MemoEditor = ({ label }: MemoEditorProps) => {
  // 🚀 直接读取全局元数据
  const [memo, setLocalMemo] = useState(() => {
    const meta = getDomainMeta(label);
    return meta?.memo || "";
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState("");

  const queryClient = useQueryClient();
  const hasMemo = !!memo;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditValue(memo);
    }
    setIsOpen(open);
  };

  const handleSave = () => {
    try {
      const newValue = editValue.trim();

      // 1. 更新全局存储
      updateDomainMeta(label, { memo: newValue });

      // 2. 更新所有相关缓存 (Home, Collections, Mine)
      // 使用 setQueriesData 模糊匹配所有包含 "records" 的查询
      // 这样无论用户在哪里修改，所有视图都会同步更新
      queryClient.setQueriesData<NameRecord[]>(
        { queryKey: ["name-records"] }, // 匹配 Home
        (old) => updateCache(old, label, newValue),
      );
      queryClient.setQueriesData<NameRecord[]>(
        { queryKey: ["collection-records"] }, // 匹配 Collections & Mine
        (old) => updateCache(old, label, newValue),
      );

      setLocalMemo(newValue);
      setIsOpen(false);
      toast.success(newValue ? "备注已更新" : "备注已删除");
    } catch (e) {
      console.error(e);
      toast.error("保存失败：本地存储空间已满");
    }
  };

  // 辅助函数：更新缓存列表
  const updateCache = (
    old: NameRecord[] | undefined,
    label: string,
    memo: string,
  ) => {
    if (!old) return [];
    return old.map((r) => (r.label === label ? { ...r, memo } : r));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip content={hasMemo ? memo : "添加备注"}>
        <PopoverTrigger asChild>
          <button
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 outline-none ml-1
              ${
                isOpen
                  ? "bg-blue-100 text-link"
                  : hasMemo
                    ? "text-link hover:text-link-hover hover:bg-white"
                    : "text-gray-300 hover:text-text-main hover:bg-gray-100"
              }
            `}
          >
            <FontAwesomeIcon
              icon={hasMemo ? faCommentDots : faPenToSquare}
              size="xs"
            />
          </button>
        </PopoverTrigger>
      </Tooltip>

      <PopoverContent align="start" side="bottom" className="w-64 p-3">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-xs font-qs-semibold text-gray-400">
            编辑备注
          </span>
          <span
            className={`text-[10px] ${
              editValue.length >= MAX_MEMO_LENGTH
                ? "text-red-400 font-bold"
                : "text-gray-300"
            }`}
          >
            {editValue.length}/{MAX_MEMO_LENGTH}
          </span>
        </div>

        <textarea
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入备注信息..."
          className="w-full h-24 p-2 text-sm text-text-main bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-link/20 focus:border-link resize-none font-qs-medium"
          maxLength={MAX_MEMO_LENGTH}
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
