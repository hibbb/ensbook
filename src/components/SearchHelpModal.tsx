// src/components/SearchHelpModal.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faAt,
  faGears,
} from "@fortawesome/free-solid-svg-icons";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import { useTranslation, Trans } from "react-i18next";
import { BaseModal } from "./ui/BaseModal";

interface SearchHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchHelpModal = ({ isOpen, onClose }: SearchHelpModalProps) => {
  const { t } = useTranslation();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("search.guide.title")}
      maxWidth="max-w-lg"
    >
      <div className="p-6 space-y-6">
        <p className="text-sm text-gray-500 font-qs-medium">
          {t("search.guide.desc")}
        </p>

        <div className="space-y-4">
          {/* 模式 1: 标准搜索 */}
          <div className="flex gap-4 group">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" />
            </div>
            <div>
              <h4 className="font-qs-semibold text-text-main text-sm">
                {t("search.guide.mode.batch.title")}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {t("search.guide.mode.batch.desc")}
              </p>
              <div className="mt-2 text-sm bg-gray-50 border border-gray-100 px-3 py-2 rounded-xs font-qs-medium text-text-main">
                abc.eth apple 999
              </div>
            </div>
          </div>

          {/* 模式 2: 所有者持仓查询 */}
          <div className="flex gap-4 group">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faAt} size="sm" />
            </div>
            <div>
              <h4 className="font-qs-semibold text-text-main text-sm">
                {t("search.guide.mode.owner.title")}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                <Trans i18nKey="search.guide.mode.owner.desc">
                  使用 “<span className="text-cyan-500 font-bold">@</span> +
                  ENS（或以太坊地址）” 的格式查询。
                </Trans>
              </p>
              <div className="mt-2 text-sm bg-gray-50 border border-gray-100 px-3 py-2 rounded-xs font-qs-medium text-text-main">
                @alice.eth 或 @alice
              </div>
            </div>
          </div>

          {/* 模式 3: 绑定地址持仓查询 */}
          <div className="flex gap-4 group">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faEthereum} size="sm" />
            </div>
            <div>
              <h4 className="font-qs-semibold text-text-main text-sm">
                {t("search.guide.mode.address.title")}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {t("search.guide.mode.address.desc")}
              </p>
              <div className="mt-2 text-sm bg-gray-50 border border-gray-100 px-3 py-2 rounded-xs font-qs-medium text-text-main">
                0xd8dA...6045
              </div>
            </div>
          </div>

          {/* 模式 4: 混合查询 */}
          <div className="flex gap-4 group">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faGears} size="sm" />
            </div>
            <div>
              <h4 className="font-qs-semibold text-text-main text-sm">
                {t("search.guide.mode.mixed.title")}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {t("search.guide.mode.mixed.desc")}
              </p>
              <div className="mt-2 text-sm bg-gray-50 border border-gray-100 px-3 py-2 rounded-xs font-qs-medium text-text-main">
                apple @alice.eth 0xd8...
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <button
          onClick={onClose}
          className="w-full py-3 bg-link text-white text-sm font-qs-semibold rounded-lg hover:bg-link-hover transition-all active:scale-95 shadow-lg shadow-gray-200"
        >
          {t("common.got_it")}
        </button>
      </div>
    </BaseModal>
  );
};
