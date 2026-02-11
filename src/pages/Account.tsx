// src/pages/Account.tsx

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faUserTag,
  faWarehouse,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faCopy, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import { isAddress, type Address } from "viem";
import { normalize } from "viem/ens";
import toast from "react-hot-toast";

import { truncateAddress } from "../utils/format";

// Components
import { NameListView } from "../components/NameListView"; // 🚀

// Hooks & Services
import { useNameRecords } from "../hooks/useEnsData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { fetchLabels } from "../services/graph/fetchLabels";
import { publicClient } from "../utils/client";

const useResolveInput = (input: string | undefined) => {
  return useQuery({
    queryKey: ["resolve-account", input],
    queryFn: async (): Promise<Address | null> => {
      if (!input) return null;
      if (isAddress(input)) return input;

      let nameToResolve = input;
      if (!input.includes(".")) {
        nameToResolve = `${input}.eth`;
      }

      try {
        const normalizedName = normalize(nameToResolve);
        const address = await publicClient.getEnsAddress({
          name: normalizedName,
        });
        return address;
      } catch (error) {
        console.error("Name resolution failed:", error);
        return null;
      }
    },
    enabled: !!input,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
};

const useAccountLabels = (address: Address | null | undefined) => {
  return useQuery({
    queryKey: ["account-labels", address],
    queryFn: async () => {
      if (!address) return [];
      return await fetchLabels({
        sameOwners: [],
        pureLabels: [],
        ethAddresses: [address],
      });
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 5,
  });
};

export const Account = () => {
  const { input } = useParams<{ input: string }>();
  const { t } = useTranslation();

  const [showFullAddress, setShowFullAddress] = useState(false);

  const {
    data: resolvedAddress,
    isLoading: isResolving,
    isError: isResolveError,
  } = useResolveInput(input);

  useDocumentTitle(`Account: ${input}`);

  const {
    data: labels,
    isLoading: isFetchingLabels,
    isError: isFetchError,
  } = useAccountLabels(resolvedAddress);

  const labelsToQuery = labels || [];

  const { data: records, isLoading: isQueryingRecords } =
    useNameRecords(labelsToQuery);

  const isLoading = isResolving || isFetchingLabels || isQueryingRecords;
  const isError =
    isResolveError ||
    isFetchError ||
    (resolvedAddress === null && !isResolving);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("common.copy_success", { label }));
  };

  const { displayName, fullNameToCopy } = useMemo(() => {
    if (!input) return { displayName: "", fullNameToCopy: "" };
    if (isAddress(input)) {
      return {
        displayName: truncateAddress(input),
        fullNameToCopy: input,
      };
    }
    const full = input.includes(".") ? input : `${input}.eth`;
    return {
      displayName: full,
      fullNameToCopy: full,
    };
  }, [input]);

  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (isError) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4 animate-in fade-in">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400">
          <FontAwesomeIcon icon={faUserTag} size="2x" />
        </div>
        <div>
          <h2 className="text-lg font-sans font-semibold text-text-main">
            {t("account.error_resolve")}
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-mono">{input}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto lg:px-4 py-10 pb-24 relative">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-text-main hover:bg-gray-100 transition-all active:scale-95 outline-none"
            title="返回"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
          </button>
          <h1 className="text-4xl font-sans font-semibold">
            {t("account.title")}
          </h1>
          {isLoading && (
            <span className="text-sm text-link animate-pulse">
              {t("common.loading")}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center text-sm text-gray-500 bg-gray-50 border border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUserTag} className="text-gray-400" />
            <span className="font-sans font-regular text-gray-500">
              {t("account.name_label")}:
            </span>
            <span className="font-sans font-medium text-text-main">
              {displayName}
            </span>
            <button
              onClick={() => handleCopy(fullNameToCopy, "Name")}
              className="text-gray-400 hover:text-link transition-colors p-1"
              title="Copy Name"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>

          {resolvedAddress && (
            <>
              <div className="hidden md:block w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faWallet} className="text-gray-400" />
                <span className="font-sans font-regular text-gray-500">
                  {t("account.address_label")}:
                </span>
                <span className="text-text-main font-mono font-light">
                  {showFullAddress
                    ? resolvedAddress
                    : truncateAddress(resolvedAddress)}
                </span>
                <button
                  onClick={() => setShowFullAddress(!showFullAddress)}
                  className="text-gray-400 hover:text-link transition-colors p-1"
                  title={showFullAddress ? "Collapse" : "Expand"}
                >
                  <FontAwesomeIcon
                    icon={showFullAddress ? faEyeSlash : faEye}
                  />
                </button>
                <button
                  onClick={() => handleCopy(resolvedAddress, "Address")}
                  className="text-gray-400 hover:text-link transition-colors p-1"
                  title="Copy Address"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>

              <div className="hidden md:block w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faWarehouse} className="text-gray-400" />
                <span className="font-sans font-regular text-gray-500">
                  {t("account.total_label")}:
                </span>
                <span className="font-sans font-medium text-text-main">
                  {labels?.length || 0}
                </span>
              </div>
            </>
          )}
        </div>
      </header>

      <NameListView
        records={records}
        isLoading={isLoading}
        // 建议使用统一的 key，这样所有账户页共享排序状态，体验更好
        viewStateKey="account-global"
        showCollectionTags={true}
        isOwnerColumnReadOnly={true} // 开启只读
        allowAddToHome={true}
      />
    </div>
  );
};
