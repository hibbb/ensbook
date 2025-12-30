// src/components/NameTable/TableHeader.tsx

import type { SortField, SortConfig, FilterConfig } from "./types";
import { ThWrapper } from "./headers/ThWrapper";

// 引入拆分后的 Header 组件
import { NameHeader } from "./headers/NameHeader";
import { StatusHeader } from "./headers/StatusHeader";
import { OwnerHeader } from "./headers/OwnerHeader";
import { ActionHeader } from "./headers/ActionHeader";
import { DeleteHeader } from "./headers/DeleteHeader";

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  isConnected: boolean;
  showDelete?: boolean;
  isAllSelected?: boolean;
  onToggleSelectAll?: () => void;
  hasRenewable?: boolean;
  hasRecords?: boolean;
  topOffset?: string | number;
  onBatchDelete?: (status?: string) => void;
  uniqueStatuses?: string[];
}

export const TableHeader = ({
  sortConfig,
  onSort,
  filterConfig,
  onFilterChange,
  isConnected,
  isAllSelected,
  onToggleSelectAll,
  hasRenewable,
  showDelete,
  topOffset = 0,
  onBatchDelete,
  uniqueStatuses,
}: TableHeaderProps) => {
  const headerStyle = {
    "--header-offset":
      typeof topOffset === "number" ? `${topOffset}px` : topOffset,
  } as React.CSSProperties;

  return (
    <thead
      className="sticky top-0 z-20 bg-table-header backdrop-blur-sm transition-all duration-300 lg:top-[var(--header-offset)]"
      style={headerStyle}
    >
      <tr className="text-left">
        {/* 1. 序号 */}
        <th className="w-14">
          <ThWrapper className="justify-center">#</ThWrapper>
        </th>

        {/* 2. 名称列 */}
        <th>
          <NameHeader sortConfig={sortConfig} onSort={onSort} />
        </th>

        {/* 3. 状态列 */}
        <th>
          <StatusHeader
            sortConfig={sortConfig}
            filterConfig={filterConfig}
            onSort={onSort}
            onFilterChange={onFilterChange}
          />
        </th>

        {/* 4. 所有者列 */}
        <th>
          <OwnerHeader
            sortConfig={sortConfig}
            filterConfig={filterConfig}
            isConnected={isConnected}
            onSort={onSort}
            onFilterChange={onFilterChange}
          />
        </th>

        {/* 5. 信息列 (静态) */}
        <th>
          <ThWrapper>信息</ThWrapper>
        </th>

        {/* 6. 操作列 */}
        <th>
          <ActionHeader
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
            isConnected={isConnected}
            isAllSelected={isAllSelected}
            hasRenewable={hasRenewable}
            onToggleSelectAll={onToggleSelectAll}
          />
        </th>

        {/* 7. 删除列 */}
        <th className="text-center w-14 relative">
          <DeleteHeader
            showDelete={showDelete}
            onBatchDelete={onBatchDelete}
            uniqueStatuses={uniqueStatuses}
          />
        </th>
      </tr>
    </thead>
  );
};
