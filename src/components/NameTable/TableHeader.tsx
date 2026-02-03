// src/components/NameTable/TableHeader.tsx

import type { SortField, SortConfig, FilterConfig } from "./types";
import { ThWrapper } from "./headers/ThWrapper";
import { IndexHeader } from "./headers/IndexHeader";
import { NameHeader } from "./headers/NameHeader";
import { StatusHeader } from "./headers/StatusHeader";
import { OwnerHeader } from "./headers/OwnerHeader";
import { ActionHeader } from "./headers/ActionHeader";
import { DeleteHeader } from "./headers/DeleteHeader";

import { faPlus } from "@fortawesome/free-solid-svg-icons"; // 🚀
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { DeleteCriteria } from "./types";
import { useTranslation } from "react-i18next";
import type { NameRecord } from "../../types/ensNames"; // 🚀

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  isConnected: boolean;
  // 🗑️ 删除: showDelete?: boolean;
  // 🗑️ 删除: showAdd?: boolean;
  // 🚀 新增: 接收回调函数
  onBatchDelete?: (criteria: DeleteCriteria) => void;
  onAddToHome?: (record: NameRecord) => void;
  isAllSelected?: boolean;
  onToggleSelectAll?: () => void;
  hasRenewable?: boolean;
  hasRecords?: boolean;
  topOffset?: string | number;
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
  // 🚀 解构回调
  onBatchDelete,
  onAddToHome,
  topOffset = 0,
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
}: TableHeaderProps) => {
  const headerStyle = {
    "--header-offset":
      typeof topOffset === "number" ? `${topOffset}px` : topOffset,
  } as React.CSSProperties;

  const isControlsDisabled = totalCount <= 1;
  const { t } = useTranslation();

  return (
    <thead
      className="sticky top-0 z-20 bg-table-header backdrop-blur-sm transition-all duration-300 lg:top-[var(--header-offset)]"
      style={headerStyle}
    >
      <tr className="text-left">
        <th className="w-14 text-center">
          <IndexHeader
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
            levelCounts={levelCounts}
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
            disabled={isControlsDisabled}
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

        <th className="text-center w-14 relative">
          {/* 🚀 逻辑简化：优先判断是否支持批量删除 */}
          {onBatchDelete ? (
            <DeleteHeader
              showDelete={true} // DeleteHeader 内部可能还需要这个 prop
              onBatchDelete={onBatchDelete}
              uniqueStatuses={uniqueStatuses}
              statusCounts={statusCounts}
              nameCounts={nameCounts}
              ownershipCounts={ownershipCounts}
            />
          ) : onAddToHome ? (
            /* 🚀 添加模式：显示静态加号图标作为表头 */
            <ThWrapper className="justify-center">
              <div className="w-6 h-6 flex items-center justify-center text-gray-300 select-none">
                <FontAwesomeIcon icon={faPlus} size="sm" />
              </div>
            </ThWrapper>
          ) : null}
        </th>
      </tr>
    </thead>
  );
};
