// src/components/SearchHelpModal.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faMagnifyingGlass,
  faAt,
  faHashtag,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

interface SearchHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchHelpModal = ({ isOpen, onClose }: SearchHelpModalProps) => {
  // 🚀 优化：移除 isVisible 状态，改用 CSS 控制隐藏
  // 这样避免了在 useEffect 中同步调用 setState 导致的级联渲染错误

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* 1. 背景遮罩：2px 模糊 */}
      <div
        className={`absolute inset-0 bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 2. Modal 内容 */}
      <div
        className={`relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-qs-semibold text-text-main">
            搜索功能指南
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-text-main transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-400">
            ENSBook 支持多种高级模式，助您快速批量发现域名。
          </p>

          <div className="space-y-4">
            {/* 模式 1: 标准搜索 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" />
              </div>
              <div>
                <h4 className="font-qs-semibold text-text-main text-sm">
                  域名批量搜索
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  输入任意名称，支持空格或逗号分隔多个名称。
                </p>
                <div className="mt-2 text-xs bg-gray-50 px-3 py-2 rounded-md font-qs-medium text-text-main">
                  vitalik paradigm.eth 999
                </div>
              </div>
            </div>

            {/* 模式 2: 所有者持仓查询 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                <FontAwesomeIcon icon={faAt} size="sm" />
              </div>
              <div>
                <h4 className="font-qs-semibold text-text-main text-sm">
                  名称所有者持仓查询
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  使用 “<span className="text-purple-500 font-bold">@</span> +
                  ENS（或以太坊地址）” 的格式查询某个 ENS
                  所有者（或某个以太坊地址）持有的全部名称。
                </p>
                <div className="mt-2 text-xs bg-gray-50 px-3 py-2 rounded-md font-qs-medium text-text-main">
                  @vitalik.eth @0xd8dA6...
                </div>
              </div>
            </div>

            {/* 模式 3: 绑定地址持仓查询 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <FontAwesomeIcon icon={faHashtag} size="sm" />
              </div>
              <div>
                <h4 className="font-qs-semibold text-text-main text-sm">
                  名称绑定地址持仓查询
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  使用 “<span className="text-orange-500 font-bold">#</span> +
                  ENS” 的格式查询某个 ENS 绑定的以太坊地址持有的全部名称。
                </p>
                <div className="mt-2 text-xs bg-gray-50 px-3 py-2 rounded-md font-qs-medium text-text-main">
                  #vitalik.eth
                </div>
              </div>
            </div>

            {/* 模式 4: 混合查询 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <FontAwesomeIcon icon={faLayerGroup} size="sm" />
              </div>
              <div>
                <h4 className="font-qs-semibold text-text-main text-sm">
                  混合模式
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  同时支持上述所有格式的混合输入。
                </p>
                <div className="mt-2 text-xs bg-gray-50 px-3 py-2 rounded-md font-qs-medium text-text-main">
                  apple #vitalik.eth @0xd8...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-link text-white text-sm font-qs-semibold rounded-lg hover:bg-link-hover transition-colors active:scale-95"
          >
            明白了
          </button>
        </div>
      </div>
    </div>
  );
};
