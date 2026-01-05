// src/components/SettingsModal/MyCollectionSettings.tsx

import { useState } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faSpinner,
  faFeatherPointed,
} from "@fortawesome/free-solid-svg-icons";

import {
  getMyCollectionSource,
  saveMyCollectionSource,
} from "../../services/storage/userStore";
import { parseAndClassifyInputs } from "../../utils/parseInputs";
import { fetchLabels } from "../../services/graph/fetchLabels";

export const MyCollectionSettings = () => {
  const [input, setInput] = useState(getMyCollectionSource());
  const [isValidating, setIsValidating] = useState(false);

  const handleSave = async () => {
    const trimmed = input.trim();
    const currentStored = getMyCollectionSource();

    if (!trimmed) {
      if (currentStored) {
        if (
          window.confirm(
            "确定要清空“我的集合”吗？\n这将移除 Mine 页面中的所有自定义域名。",
          )
        ) {
          saveMyCollectionSource("");
          setInput("");
          toast.success("已清空自定义集合");
        } else {
          setInput(currentStored);
        }
      } else {
        toast("这里已经是空的了", { icon: "👻" });
      }
      return;
    }

    setIsValidating(true);
    const toastId = toast.loading("正在解析并验证域名...");

    try {
      const classified = parseAndClassifyInputs(trimmed);

      // 🚀 修复：移除 linkOwners，保留 ethAddresses
      const totalCandidates =
        classified.sameOwners.length +
        classified.pureLabels.length +
        classified.ethAddresses.length;

      if (totalCandidates === 0) {
        toast.error("未检测到有效的域名格式", { id: toastId });
        return;
      }

      const labels = await fetchLabels(classified);

      if (labels.length > 0) {
        saveMyCollectionSource(trimmed);
        toast.success(`保存成功！包含 ${labels.length} 个有效域名`, {
          id: toastId,
        });
      } else {
        toast.error("未能找到任何有效的域名，请检查输入规则", { id: toastId });
      }
    } catch (error) {
      console.error("验证失败:", error);
      toast.error("验证过程发生网络错误", { id: toastId });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-600">
        <h4 className="font-qs-bold text-gray-800 flex items-center gap-2 mb-3 text-base">
          <FontAwesomeIcon icon={faFeatherPointed} className="text-link" />
          自由定义你的 ENS 视界
        </h4>
        <p className="leading-relaxed mb-3">
          在这里，你可以将任何你感兴趣的 ENS 域名组合成一个专属集合 (Mine)。
          支持混合输入：
        </p>
        <div className="flex flex-wrap gap-2 font-mono text-xs text-text-main">
          <span className="bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">
            abc, hello, 12345
          </span>
          <span className="bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">
            @vitalik.eth
          </span>
          {/* 🚀 UI 更新：直接显示地址示例，不再带 # 前缀 */}
          <span className="bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">
            0xd8dA...6045
          </span>
        </div>
      </div>

      <div className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="在此输入索引字符串... (支持逗号、空格或换行分隔)"
          rows={6}
          className="w-full p-4 bg-white border border-gray-200 rounded-xl font-mono text-sm text-text-main
            focus:outline-none focus:ring-2 focus:ring-link/20 focus:border-link transition-all resize-none shadow-sm
            placeholder:text-gray-300"
          spellCheck={false}
        />
        <div className="absolute bottom-3 right-3 text-[10px] text-gray-300 font-mono bg-white/80 px-1 rounded backdrop-blur-sm">
          {input.length} chars
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-qs-medium">
          {isValidating ? (
            <span className="flex items-center gap-2 text-link animate-pulse">
              <FontAwesomeIcon icon={faSpinner} spin />
              正在解析区块链数据...
            </span>
          ) : getMyCollectionSource() ? (
            <span className="text-emerald-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              当前状态：已生效
            </span>
          ) : (
            <span className="text-gray-400">当前状态：未配置</span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isValidating}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-qs-bold text-white transition-all shadow-md transform
            ${
              isValidating
                ? "bg-gray-400 cursor-not-allowed opacity-80"
                : "bg-link hover:bg-link-hover active:scale-95"
            }`}
        >
          {isValidating ? (
            "验证中"
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} />
              保存集合
            </>
          )}
        </button>
      </div>
    </div>
  );
};
