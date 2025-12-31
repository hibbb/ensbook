// src/components/NameTable/TableHeader.tsx

import type { SortField, SortConfig, FilterConfig } from "./types";
import { ThWrapper } from "./headers/ThWrapper";

// 引入所有拆分后的 Header 组件
import { IndexHeader } from "./headers/IndexHeader";
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
  totalCount?: number;
  filteredCount?: number;
  statusCounts?: Record<string, number>;
  actionCounts?: { all: number; register: number; renew: number };
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
  totalCount = 0,
  filteredCount = 0,
  statusCounts = {},
  actionCounts = { all: 0, register: 0, renew: 0 },
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
        <th className="w-14 text-center">
          <IndexHeader totalCount={totalCount} filteredCount={filteredCount} />
        </th>

        <th>
          <NameHeader sortConfig={sortConfig} onSort={onSort} />
        </th>

        <th>
          <StatusHeader
            sortConfig={sortConfig}
            filterConfig={filterConfig}
            onSort={onSort}
            onFilterChange={onFilterChange}
            statusCounts={statusCounts}
          />
        </th>

        <th>
          <OwnerHeader
            sortConfig={sortConfig}
            filterConfig={filterConfig}
            isConnected={isConnected}
            onSort={onSort}
            onFilterChange={onFilterChange}
          />
        </th>

        <th>
          <ThWrapper>信息</ThWrapper>
        </th>

        <th>
          <ActionHeader
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
            isConnected={isConnected}
            isAllSelected={isAllSelected}
            hasRenewable={hasRenewable}
            onToggleSelectAll={onToggleSelectAll}
            actionCounts={actionCounts}
          />
        </th>

        <th className="text-center w-14 relative">
          <DeleteHeader
            showDelete={showDelete}
            onBatchDelete={onBatchDelete}
            uniqueStatuses={uniqueStatuses}
            statusCounts={statusCounts} // 🚀 透传 statusCounts
          />
        </th>
      </tr>
    </thead>
  );
};
