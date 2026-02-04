// src/pages/CollectionDetail.tsx

import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// Components
import { NameListView } from "../components/NameListView"; // 🚀

// Hooks & Services
import { useCollectionRecords } from "../hooks/useEnsData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { addToHome, getHomeLabels } from "../services/storage/userStore";

// Config & Utils
import { ENS_COLLECTIONS } from "../config/collections";
import type { NameRecord } from "../types/ensNames";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { t } = useTranslation();

  useDocumentTitle(collection ? t(collection.displayName) : undefined);

  const { data: records, isLoading, isError } = useCollectionRecords(id || "");

  const handleAddToHome = (record: NameRecord) => {
    const currentList = getHomeLabels();
    const exists = currentList.includes(record.label);
    addToHome(record.label);
    if (exists) {
      toast(t("home.toast.all_exist"), { icon: "👌" });
    } else {
      toast.success(t("home.toast.add_success", { count: 1 }));
    }
  };

  if (!collection)
    return <div className="p-20 text-center">{t("collection.not_found")}</div>;
  if (isError)
    return (
      <div className="p-20 text-center text-red-500">
        {t("collection.load_fail")}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto lg:px-4 py-10 pb-24 relative">
      <header className="mb-10">
        <h1 className="text-4xl font-sans font-semibold">
          {t(collection.displayName)}
        </h1>
        <p className="text-gray-400 mt-2 ml-2">{t(collection.description)}</p>
      </header>

      {/* 🚀 使用 NameListView */}
      <NameListView
        records={records}
        isLoading={isLoading}
        context="collection"
        collectionId={id}
        onAddToHome={handleAddToHome}
      />
    </div>
  );
};
