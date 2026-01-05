// src/components/SearchHelpModal.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faAt,
  faGears,
} from "@fortawesome/free-solid-svg-icons";
import { BaseModal } from "./ui/BaseModal"; // 🚀 引入 BaseModal
import { faEthereum } from "@fortawesome/free-brands-svg-icons";

interface SearchHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchHelpModal = ({ isOpen, onClose }: SearchHelpModalProps) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="搜索功能指南"
      maxWidth="max-w-lg"
    >
      <div className="p-6 space-y-6">
        <p className="text-sm text-gray-500 font-qs-medium">
          ENSBook 支持多种高级模式，助您快速批量发现域名。
        </p>

        <div className="space-y-4">
          {/* 模式 1: 标准搜索 */}
          <div className="flex gap-4 group">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" />
            </div>
            <div>
              <h4 className="font-qs-bold text-text-main text-sm">
                域名批量搜索
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                输入任意名称或名称标签，支持空格或逗号分隔多个名称。
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
              <h4 className="font-qs-bold text-text-main text-sm">
                名称所有者持仓查询
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                使用 “<span className="text-cyan-500 font-bold">@</span> +
                ENS/标签” 的格式查询。
              </p>
              <div className="mt-2 text-sm bg-gray-50 border border-gray-100 px-3 py-2 rounded-xs font-qs-medium text-text-main">
                @vitalik.eth 或 @vitalik
              </div>
            </div>
          </div>

          {/* 模式 3: 绑定地址持仓查询 */}
          <div className="flex gap-4 group">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faEthereum} size="sm" />
            </div>
            <div>
              <h4 className="font-qs-bold text-text-main text-sm">
                以太坊地址持仓查询
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                直接输入以太坊地址查询其 ENS 名称持仓情况。
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
              <h4 className="font-qs-bold text-text-main text-sm">混合模式</h4>
              <p className="text-xs text-gray-400 mt-1">
                同时支持上述所有格式的混合输入。
              </p>
              <div className="mt-2 text-sm bg-gray-50 border border-gray-100 px-3 py-2 rounded-xs font-qs-medium text-text-main">
                apple @vitalik.eth 0xd8...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="px-6 pb-6 pt-2">
        <button
          onClick={onClose}
          className="w-full py-3 bg-link text-white text-sm font-qs-bold rounded-lg hover:bg-link-hover transition-all active:scale-95 shadow-lg shadow-gray-200"
        >
          明白了
        </button>
      </div>
    </BaseModal>
  );
};
