// src/pages/Mine.tsx

import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFeatherPointed } from "@fortawesome/free-solid-svg-icons";
import { useTranslation, Trans } from "react-i18next";

// Components
import { NameListView } from "../components/NameListView"; // 🚀

// Hooks & Services
import { useNameRecords } from "../hooks/useEnsData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useMyCollectionSource } from "../hooks/useMyCollectionSource";
import { parseAndClassifyInputs } from "../utils/parseInputs";
import { fetchLabels } from "../services/graph/fetchLabels";

const useMyCollectionLabels = (source: string) => {
  return useQuery({
    queryKey: ["my-collection-labels", source],
    queryFn: async () => {
      if (!source) return [];
      const classified = parseAndClassifyInputs(source);
      return await fetchLabels(classified);
    },
    enabled: !!source,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const Mine = () => {
  const { t } = useTranslation();
  useDocumentTitle("Mine");

  const source = useMyCollectionSource();
  const hasSource = !!source && source.length > 0;

  const {
    data: labels,
    isLoading: isResolving,
    isError: isResolveError,
  } = useMyCollectionLabels(source);

  const labelsToQuery = isResolving ? [] : labels || [];

  const {
    data: records,
    isLoading: isQuerying,
    isError: isQueryError,
  } = useNameRecords(labelsToQuery);

  const isLoading = isResolving || isQuerying;
  const isError = isResolveError || isQueryError;

  if (!hasSource) {
    return (
      <div className="max-w-7xl mx-auto lg:px-4 py-20 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
          <FontAwesomeIcon icon={faFeatherPointed} size="2x" />
        </div>
        <h2 className="text-2xl font-sans font-medium text-text-main mb-3">
          {t("mine.empty_state.title")}
        </h2>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
          <Trans i18nKey="mine.empty_state.desc">
            The Mine page allows you to create an exclusive domain collection
            through custom rules
            <br />
            (e.g., "abc, hello, 12345", "@alice.eth", or Ethereum addresses).
          </Trans>
        </p>
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-400 mb-8 font-mono">
          <Trans i18nKey="mine.empty_state.guide">
            Please go to{" "}
            <span className="text-text-main">Settings {">"} My Collection</span>{" "}
            to configure
          </Trans>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-20 text-center text-red-500">{t("mine.error")}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto lg:px-4 py-10 pb-24 relative">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-sans font-semibold flex items-center gap-3">
            {t("mine.title")}
            <span className="text-sm bg-text-main text-white px-2 py-1 rounded-md font-semibold tracking-wide transform -translate-y-4">
              {t("mine.subtitle")}
            </span>
          </h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faFeatherPointed} className="text-xs" />
            <span>{t("mine.custom_collection")}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
            <span className="font-mono text-xs opacity-70 truncate max-w-[300px]">
              {source}
            </span>
          </p>
        </div>
      </header>

      <NameListView
        records={records}
        isLoading={isLoading}
        viewStateKey="mine"
        showCollectionTags={true} // Mine 是杂烩，需要标记
        isOwnerColumnReadOnly={false}
        allowAddToHome={true} // 允许添加到 Home
      />
    </div>
  );
};
