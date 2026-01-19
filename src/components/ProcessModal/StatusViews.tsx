import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faCircleNotch,
  faExternalLinkAlt,
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { truncateAddress } from "../../utils/format";

interface ProcessingViewProps {
  status: string;
  secondsLeft: number;
  txHash?: string | null;
}

export const ProcessingView = ({
  status,
  secondsLeft,
  txHash,
}: ProcessingViewProps) => {
  const { t } = useTranslation();

  let message = t("transaction.status.processing");
  let subMessage = t("transaction.status.confirm_wallet");
  let showTimer = false;
  const isWaitingWallet = ["loading", "registering", "committing"].includes(
    status,
  );

  if (status === "committing") {
    message = t("transaction.step.commit_title");
    subMessage = t("transaction.step.commit_desc");
  } else if (status === "waiting_commit") {
    message = t("transaction.step.wait_commit_title");
    subMessage = t("transaction.step.wait_commit_desc");
  } else if (status === "counting_down") {
    message = t("transaction.step.cooldown_title");
    subMessage = t("transaction.step.cooldown_desc");
    showTimer = true;
  } else if (status === "registering") {
    message = t("transaction.step.register_title");
    subMessage = t("transaction.step.register_desc");
  } else if (status === "waiting_register") {
    message = t("transaction.step.wait_register_title");
    subMessage = t("transaction.step.wait_register_desc");
  } else if (status === "loading") {
    message = t("transaction.step.loading_title");
    subMessage = t("transaction.step.loading_desc");
  }

  return (
    <div className="text-center py-6 animate-in zoom-in-95 duration-300">
      <div className="relative inline-block mb-6">
        {showTimer ? (
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xl font-bold border-2 border-orange-100">
            {secondsLeft}s
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-link/20 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-16 h-16 bg-link/10 rounded-full flex items-center justify-center text-link text-2xl">
              {isWaitingWallet ? (
                <FontAwesomeIcon icon={faWallet} className="animate-pulse" />
              ) : (
                <FontAwesomeIcon icon={faCircleNotch} spin />
              )}
            </div>
          </>
        )}
      </div>
      <h3 className="text-lg font-qs-semibold text-text-main mb-1">
        {message}
      </h3>
      <p className="text-xs text-gray-500 mb-6 max-w-[85%] mx-auto">
        {subMessage}
      </p>
      {txHash && (
        <a
          href={`https://etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md text-xs text-link hover:text-link-hover hover:bg-gray-100 transition-colors border border-gray-100"
        >
          <span>{truncateAddress(txHash, 10, 8)}</span>
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </a>
      )}
    </div>
  );
};

export const SuccessView = ({
  type,
  onClose,
}: {
  type: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-6 animate-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-3xl mx-auto mb-4 border border-green-100">
        <FontAwesomeIcon icon={faCheckCircle} />
      </div>
      <h3 className="text-xl font-qs-semibold text-text-main mb-2">
        {type === "register"
          ? t("transaction.result.success_register")
          : t("transaction.result.success_renew")}
      </h3>
      <p className="text-sm text-gray-500 mb-6 px-4">
        {t("transaction.result.success_desc")}
      </p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-lg font-qs-semibold text-sm bg-link text-white hover:bg-link-hover transition-all active:scale-95 shadow-lg shadow-link/20"
      >
        {t("common.finish")}
      </button>
    </div>
  );
};

export const ErrorView = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-4">
      <div className="text-red-500 text-3xl mb-3">
        <FontAwesomeIcon icon={faExclamationCircle} />
      </div>
      <p className="text-text-main font-bold mb-1">
        {t("transaction.result.error_title")}
      </p>
      <p className="text-xs text-gray-500 mb-6">
        {t("transaction.result.error_desc")}
      </p>
      <button
        onClick={onClose}
        className="text-link text-sm font-qs-semibold hover:underline"
      >
        {t("common.retry")}
      </button>
    </div>
  );
};
