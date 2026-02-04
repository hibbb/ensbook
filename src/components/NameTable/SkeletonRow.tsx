// src/components/NameTable/SkeletonRow.tsx

export const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50 last:border-0 bg-white/50">
    {/* 序号列 */}
    <td>
      <div className="h-14 flex items-center justify-center">
        <div className="h-6 w-4 bg-gray-200 rounded-lg"></div>
      </div>
    </td>

    {/* 名称列 (较宽) */}
    <td>
      <div className="h-14 flex items-center">
        <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
      </div>
    </td>

    {/* 状态列 (胶囊状) */}
    <td>
      <div className="h-14 flex items-center">
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
    </td>

    {/* 所有者列 */}
    <td>
      <div className="h-14 flex items-center">
        <div className="h-6 w-24 bg-gray-200 rounded-lg"></div>
      </div>
    </td>

    {/* 🚀 新增：市场数据列 (右对齐) */}
    <td>
      <div className="h-14 flex items-center justify-start gap-2">
        <div className="h-6 w-10 bg-gray-200 rounded-lg"></div>
        <div className="h-6 w-10 bg-gray-200 rounded-lg"></div>
      </div>
    </td>

    {/* 操作列 (两个按钮占位) */}
    <td>
      <div className="h-14 flex items-center justify-start gap-2">
        <div className="h-6 w-8 bg-gray-200 rounded-lg"></div>
        <div className="h-6 w-8 bg-gray-200 rounded-lg"></div>
      </div>
    </td>

    {/* 外部链接列 (右对齐) */}
    <td>
      <div className="h-14 flex items-center justify-start">
        <div className="h-6 w-16 bg-gray-200 rounded-lg"></div>
      </div>
    </td>

    {/* 删除按钮列 */}
    <td>
      <div className="h-14 flex items-center justify-center">
        <div className="h-6 w-4 bg-gray-200 rounded-lg"></div>
      </div>
    </td>
  </tr>
);
