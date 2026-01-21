// src/components/SettingsModal/MyCollectionSettings.tsx

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFeatherPointed,
  faSpinner,
  faTrash, // 🚀 1. 引入删除图标
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import {
  getMyCollectionSource,
  saveMyCollectionSource,
  getUserSettings,
  updateSettings,
} from "../../services/storage/userStore";
import { parseAndClassifyInputs } from "../../utils/parseInputs";
import { fetchLabels } from "../../services/graph/fetchLabels";

export const MyCollectionSettings = () => {
  const [input, setInput] = useState(getMyCollectionSource());
  const [isValidating, setIsValidating] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const settings = getUserSettings();
    setIsHomepage(settings.mineAsHomepage || false);
  }, []);

  const handleToggleHomepage = () => {
    const newValue = !isHomepage;
    setIsHomepage(newValue);
    updateSettings({ mineAsHomepage: newValue });
    toast.success(
      newValue
        ? t("settings.my_collection.toast.home_set")
        : t("settings.my_collection.toast.home_unset"),
    );
  };

  // 🚀 2. 新增清空函数
  // 逻辑完全复用 handleSave 中处理空输入的部分
  const handleClear = () => {
    if (window.confirm(t("settings.my_collection.confirm.clear"))) {
      saveMyCollectionSource("");
      // 注意：视图状态的清理已在 userStore.saveMyCollectionSource 中自动处理
      setInput("");
      toast.success(t("settings.my_collection.toast.cleared"));
    }
  };

  const handleSave = async () => {
    const trimmed = input.trim();
    const currentStored = getMyCollectionSource();

    if (!trimmed) {
      if (currentStored) {
        // 复用同样的逻辑
        handleClear();
      } else {
        toast(t("settings.my_collection.toast.already_empty"), { icon: "👻" });
      }
      return;
    }

    setIsValidating(true);
    const toastId = toast.loading(t("settings.my_collection.toast.validating"));

    try {
      const classified = parseAndClassifyInputs(trimmed);
      const totalCandidates =
        classified.sameOwners.length +
        classified.pureLabels.length +
        classified.ethAddresses.length;

      if (totalCandidates === 0) {
        toast.error(t("settings.my_collection.toast.no_valid_format"), {
          id: toastId,
        });
        return;
      }

      const labels = await fetchLabels(classified);

      if (labels.length > 0) {
        saveMyCollectionSource(trimmed);
        toast.success(
          t("settings.my_collection.toast.save_success", {
            count: labels.length,
          }),
          {
            id: toastId,
          },
        );
      } else {
        toast.error(t("settings.my_collection.toast.no_valid_found"), {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("验证失败:", error);
      toast.error(t("settings.my_collection.toast.network_error"), {
        id: toastId,
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-sm text-text-main/80">
        <h4 className="font-qs-semibold text-base text-black mb-2">
          <FontAwesomeIcon icon={faFeatherPointed} className="mr-2" />
          {t("settings.my_collection.ui.title")}
        </h4>
        <p className="leading-relaxed mb-3">
          {t("settings.my_collection.ui.desc")}
        </p>
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <span className="bg-gray-100/70 px-2 py-0.5 rounded text-text-main/80">
            abc, hello, 123
          </span>
          <span className="bg-gray-100/70 px-2 py-0.5 rounded text-text-main/80">
            @alice.eth
          </span>
          <span className="bg-gray-100/70 px-2 py-0.5 rounded text-text-main/80">
            0xd8dA...6045
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100/80"></div>

      <div className="flex items-center justify-between py-1">
        <div className="flex flex-col">
          <span className="font-qs-semibold text-sm text-black">
            {t("settings.my_collection.ui.set_home")}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">
            {t("settings.my_collection.ui.set_home_desc")}
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isHomepage}
            onChange={handleToggleHomepage}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-link/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-link"></div>
        </label>
      </div>

      <div className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("settings.my_collection.ui.placeholder")}
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

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-qs-medium">
          {isValidating ? (
            <span className="flex items-center gap-2 text-link animate-pulse">
              <FontAwesomeIcon icon={faSpinner} spin />
              {t("settings.my_collection.ui.status_validating")}
            </span>
          ) : getMyCollectionSource() ? (
            <span className="text-emerald-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t("settings.my_collection.ui.status_active")}
            </span>
          ) : (
            <span className="text-gray-400">
              {t("settings.my_collection.ui.status_inactive")}
            </span>
          )}
        </div>

        {/* 🚀 3. 修改按钮区域：增加 flex 容器和 Clear 按钮 */}
        <div className="flex items-center gap-3">
          {input.trim().length > 0 && (
            <button
              onClick={handleClear}
              disabled={isValidating}
              className="px-4 py-2 text-sm font-qs-semibold text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t("common.clear")}
            >
              <FontAwesomeIcon icon={faTrash} size="sm" />
              {t("common.clear")}
            </button>
          )}

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
              t("settings.my_collection.ui.btn_validating")
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} />
                {t("common.save")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
