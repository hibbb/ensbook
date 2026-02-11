// src/pages/CollectionDetail.tsx

import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Components
import { NameListView } from "../components/NameListView"; // 🚀

// Hooks & Services
import { useCollectionRecords } from "../hooks/useEnsData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Config & Utils
import { ENS_COLLECTIONS } from "../config/collections";

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const collection = id ? ENS_COLLECTIONS[id] : null;
  const { t } = useTranslation();

  useDocumentTitle(collection ? t(collection.displayName) : undefined);

  const { data: records, isLoading, isError } = useCollectionRecords(id || "");

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

      <NameListView
        records={records}
        isLoading={isLoading}
        viewStateKey={`collection-${id}`}
        showCollectionTags={false} // 集合页不需要标记
        isOwnerColumnReadOnly={false}
        allowAddToHome={true}
      />
    </div>
  );
};
