// src/components/NameTable/TableHeader.tsx

import type { SortField, SortConfig, FilterConfig } from "./types";
import { ThWrapper } from "./headers/ThWrapper";
import { IndexHeader } from "./headers/IndexHeader";
import { NameHeader } from "./headers/NameHeader";
import { StatusHeader } from "./headers/StatusHeader";
import { OwnerHeader } from "./headers/OwnerHeader";
import { ActionHeader } from "./headers/ActionHeader";
import { ControlHeader } from "./headers/ControlHeader";

import type { DeleteCriteria } from "./types";
import { useTranslation } from "react-i18next";
import type { NameRecord } from "../../types/ensNames";

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  isConnected: boolean;
  onBatchDelete?: (criteria: DeleteCriteria) => void;
  onAddToHome?: (record: NameRecord) => void;
  isAllSelected?: boolean;
  onToggleSelectAll?: () => void;
  hasRenewable?: boolean;
  hasRecords?: boolean;
  uniqueStatuses?: string[];
  totalCount?: number;
  filteredCount?: number;
  statusCounts?: Record<string, number>;
  actionCounts?: { all: number; register: number; renew: number };
  nameCounts?: {
    lengthCounts: Record<number, number>;
    availableLengths: number[];
    wrappedCounts: { all: number; wrapped: number; unwrapped: number };
    memosCount?: number;
    memoTotal?: number;
  };
  ownershipCounts?: { mine: number; others: number };
  levelCounts?: Record<number, number>;
  ownerCounts?: {
    count: number;
    label: string;
    address: string;
    isMyself: boolean;
  }[];
  ownerStats?: { total: number; displayed: number };
  isOwnerColumnReadOnly?: boolean;
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
  onBatchDelete,
  onAddToHome,
  uniqueStatuses,
  totalCount = 0,
  statusCounts = {},
  actionCounts = { all: 0, register: 0, renew: 0 },
  nameCounts = {
    lengthCounts: {},
    availableLengths: [],
    wrappedCounts: { all: 0, wrapped: 0, unwrapped: 0 },
    memosCount: 0,
    memoTotal: 0,
  },
  ownershipCounts = { mine: 0, others: 0 },
  levelCounts = {},
  ownerCounts = [],
  ownerStats = { total: 0, displayed: 0 },
  isOwnerColumnReadOnly,
}: TableHeaderProps) => {
  const isControlsDisabled = totalCount <= 1;
  const { t } = useTranslation();

  return (
    <thead className="sticky top-0 z-20 bg-table-header backdrop-blur-sm transition-all duration-300">
      <tr className="text-left">
        <th className="w-14 text-center rounded-tl-xl">
          <IndexHeader
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
            levelCounts={levelCounts}
            disabled={isControlsDisabled}
          />
        </th>

        <th>
          <NameHeader
            sortConfig={sortConfig}
            onSort={onSort}
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
            nameCounts={nameCounts}
            disabled={isControlsDisabled}
          />
        </th>

        <th>
          <StatusHeader
            sortConfig={sortConfig}
            filterConfig={filterConfig}
            onSort={onSort}
            onFilterChange={onFilterChange}
            statusCounts={statusCounts}
            disabled={isControlsDisabled}
          />
        </th>

        <th>
          <OwnerHeader
            sortConfig={sortConfig}
            filterConfig={filterConfig}
            isConnected={isConnected}
            onSort={onSort}
            onFilterChange={onFilterChange}
            ownerCounts={ownerCounts}
            ownerStats={ownerStats}
            disabled={isControlsDisabled || isOwnerColumnReadOnly}
          />
        </th>

        <th>
          <ThWrapper>{t("table.header.market")}</ThWrapper>
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
            disabled={isControlsDisabled}
          />
        </th>

        <th>
          <ThWrapper>{t("table.header.info")}</ThWrapper>
        </th>

        <th className="text-center w-14 relative rounded-tr-xl">
          {/* 使用统一的 ControlHeader */}
          <ControlHeader
            onBatchDelete={onBatchDelete}
            onAddToHome={!!onAddToHome} // 转换为布尔值，仅用于判断模式
            uniqueStatuses={uniqueStatuses}
            statusCounts={statusCounts}
            nameCounts={nameCounts}
            ownershipCounts={ownershipCounts}
          />
        </th>
      </tr>
    </thead>
  );
};
