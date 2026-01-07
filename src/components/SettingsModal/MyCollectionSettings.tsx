// src/components/SettingsModal/MyCollectionSettings.tsx

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFeatherPointed,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import {
  getMyCollectionSource,
  saveMyCollectionSource,
  saveCollectionViewState,
  getUserSettings,
  updateSettings,
} from "../../services/storage/userStore";
import { parseAndClassifyInputs } from "../../utils/parseInputs";
import { fetchLabels } from "../../services/graph/fetchLabels";

export const MyCollectionSettings = () => {
  const [input, setInput] = useState(getMyCollectionSource());
  const [isValidating, setIsValidating] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);

  useEffect(() => {
    const settings = getUserSettings();
    setIsHomepage(settings.mineAsHomepage || false);
  }, []);

  const handleToggleHomepage = () => {
    const newValue = !isHomepage;
    setIsHomepage(newValue);
    updateSettings({ mineAsHomepage: newValue });
    toast.success(newValue ? "Mine 已设置为默认首页" : "已恢复默认首页");
  };

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
          saveCollectionViewState("mine", {});
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
      {/* 🚀 优化 2: 扁平化、简洁的引导说明 */}
      <div className="text-sm text-text-main/80">
        <h4 className="font-qs-semibold text-base text-black mb-2">
          <FontAwesomeIcon icon={faFeatherPointed} className="mr-2" />
          自由定义你的 ENS 视界
        </h4>
        <p className="leading-relaxed mb-3">
          在这里，你可以将任何你感兴趣的 ENS 域名组合成一个专属集合 (Mine)。
          支持混合输入：
        </p>
        {/* 使用更扁平的代码块样式 */}
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <span className="bg-gray-100/70 px-2 py-0.5 rounded text-text-main/80">
            abc, hello, 123
          </span>
          <span className="bg-gray-100/70 px-2 py-0.5 rounded text-text-main/80">
            @vitalik.eth
          </span>
          <span className="bg-gray-100/70 px-2 py-0.5 rounded text-text-main/80">
            0xd8dA...6045
          </span>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="border-t border-gray-100/80"></div>

      {/* 🚀 优化 1: 修复错位、更标准的开关按钮 UI */}
      <div className="flex items-center justify-between py-1">
        <div className="flex flex-col">
          <span className="font-qs-semibold text-sm text-black">
            设为默认首页
          </span>
          <span className="text-xs text-gray-400 mt-0.5">
            打开 ENSBook 时默认显示 Mine 页面
          </span>
        </div>

        {/* 使用标准的 label + input checkbox 实现，更稳定 */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isHomepage}
            onChange={handleToggleHomepage}
          />
          {/* 轨道 */}
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-link/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-link"></div>
        </label>
      </div>

      {/* 编辑区域 */}
      <div className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="在此输入索引字符串... (支持逗号、空格或换行分隔)"
          rows={5}
          className="w-full p-4 bg-white border border-gray-200 rounded-xl font-mono text-sm text-text-main
            focus:outline-none focus:ring-2 focus:ring-link/20 focus:border-link transition-all resize-none shadow-sm
            placeholder:text-gray-300"
          spellCheck={false}
        />
        <div className="absolute bottom-3 right-3 text-[10px] text-gray-300 font-mono bg-white/80 px-1 rounded backdrop-blur-sm">
          {input.length} chars
        </div>
      </div>

      {/* 操作栏 */}
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
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-qs-semibold text-white transition-all shadow-md transform
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
