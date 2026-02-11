// src/pages/Home.tsx

import { useState, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { namehash, labelhash } from "viem";

// Components
import { HomeSearchSection } from "./Home/HomeSearchSection";
import { SearchHelpModal } from "../components/SearchHelpModal";
import { NameListView } from "../components/NameListView"; // 🚀

// Hooks & Services
import { useNameRecords } from "../hooks/useEnsData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { parseAndClassifyInputs } from "../utils/parseInputs";
import { fetchLabels } from "../services/graph/fetchLabels";
import {
  getHomeLabels,
  bulkAddToHome,
  removeFromHome,
  bulkRemoveFromHome,
  clearHomeList,
} from "../services/storage/userStore";

// Types
import type { NameRecord } from "../types/ensNames";
import type { DeleteCriteria } from "../components/NameTable/types";

export const Home = () => {
  const { address } = useAccount(); // 仅用于判断是否连接，传给 NameListView 内部的 Hook 已经不需要了，但这里保留也没事
  const { t } = useTranslation();
  useDocumentTitle("Home");

  const [resolvedLabels, setResolvedLabels] = useState<string[]>(() =>
    getHomeLabels(),
  );
  const [inputValue, setInputValue] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { data: fetchedRecords } = useNameRecords(resolvedLabels);

  // 乐观 UI 数据合并
  const mergedRecords = useMemo(() => {
    const recordMap = new Map(fetchedRecords?.map((r) => [r.label, r]));
    return resolvedLabels.map((label) => {
      const remote = recordMap.get(label);
      if (remote) return remote;
      return {
        label,
        namehash: namehash(`${label}.eth`),
        labelhash: labelhash(label),
        length: label.length,
        status: "Unknown",
        owner: null,
        wrapped: false,
        registeredTime: 0,
        expiryTime: 0,
        releaseTime: 0,
        level: 0,
        memo: "",
      } as NameRecord;
    });
  }, [resolvedLabels, fetchedRecords]);

  const hasContent = resolvedLabels.length > 0;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setIsResolving(true);
    try {
      const classified = parseAndClassifyInputs(inputValue);
      const fetchedLabels = await fetchLabels(classified);

      if (fetchedLabels.length > 0) {
        const currentSet = new Set(resolvedLabels);
        const newUniqueLabels = fetchedLabels.filter((l) => !currentSet.has(l));

        if (newUniqueLabels.length === 0) {
          toast(t("home.toast.all_exist"), { icon: "👌" });
        } else {
          bulkAddToHome(newUniqueLabels);
          setResolvedLabels(getHomeLabels());
          toast.success(
            t("home.toast.add_success", { count: newUniqueLabels.length }),
          );
          setInputValue("");
        }
      } else {
        toast(t("home.toast.no_valid"), { icon: "🤔" });
      }
    } catch (error) {
      console.error("解析失败:", error);
      toast.error(t("home.toast.parse_error"));
    } finally {
      setIsResolving(false);
    }
  };

  const handleDelete = useCallback((record: NameRecord) => {
    removeFromHome(record.label);
    setResolvedLabels((prev) => prev.filter((l) => l !== record.label));
  }, []);

  const handleBatchDelete = useCallback(
    (criteria: DeleteCriteria) => {
      const targetRecords = mergedRecords;
      if (!targetRecords) return;

      const { type, value } = criteria;

      if (type === "all") {
        if (window.confirm(t("home.toast.clear_confirm"))) {
          clearHomeList();
          setResolvedLabels([]);
        }
        return;
      }

      let labelsToDelete = new Set<string>();

      switch (type) {
        case "status":
          labelsToDelete = new Set(
            targetRecords.filter((r) => r.status === value).map((r) => r.label),
          );
          break;
        case "length":
          labelsToDelete = new Set(
            targetRecords
              .filter((r) => r.label.length === value)
              .map((r) => r.label),
          );
          break;
        case "wrapped": {
          const isWrapped = value as boolean;
          labelsToDelete = new Set(
            targetRecords
              .filter((r) => r.wrapped === isWrapped)
              .map((r) => r.label),
          );
          break;
        }
        case "owner": {
          if (!address) {
            toast.error(t("common.connect_wallet"));
            return;
          }
          const isDeletingMine = value === "mine";
          labelsToDelete = new Set(
            targetRecords
              .filter((r) => {
                const recordOwner = r.owner?.toLowerCase();
                const myAddress = address.toLowerCase();
                const isOwner = recordOwner === myAddress;
                return isDeletingMine ? isOwner : !isOwner;
              })
              .map((r) => r.label),
          );
          break;
        }
      }

      if (labelsToDelete.size === 0) return;

      bulkRemoveFromHome(Array.from(labelsToDelete));
      setResolvedLabels((prev) =>
        prev.filter((label) => !labelsToDelete.has(label)),
      );
      toast.success(t("home.toast.delete_success"));
    },
    [mergedRecords, address, t],
  );

  return (
    <div className="max-w-7xl mx-auto lg:px-4 relative min-h-[85vh] flex flex-col">
      <HomeSearchSection
        hasContent={hasContent}
        inputValue={inputValue}
        isResolving={isResolving}
        onInputChange={setInputValue}
        onSubmit={() => handleSubmit()}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {hasContent && (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards pb-20">
          <NameListView
            records={mergedRecords}
            isLoading={isResolving}
            viewStateKey="home"
            showCollectionTags={true}
            isOwnerColumnReadOnly={false}
            allowAddToHome={false} // Home 不需要添加到 Home
            onDelete={handleDelete}
            onBatchDelete={handleBatchDelete}
          />
        </div>
      )}

      <SearchHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
