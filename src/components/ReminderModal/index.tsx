// src/components/ReminderModal/index.tsx

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faBell } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";
import { BaseModal } from "../ui/BaseModal";
import {
  generateICS,
  generateGoogleCalendarUrl,
  downloadICS,
} from "../../utils/calendar";
import type { NameRecord } from "../../types/ensNames";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: NameRecord | null;
}

const formatExpiry = (timestamp: number) => {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
};

export const ReminderModal = ({
  isOpen,
  onClose,
  record,
}: ReminderModalProps) => {
  const [selectedReminders, setSelectedReminders] = useState<number[]>([30, 7]);
  const { t } = useTranslation();

  if (!record) return null;

  const handleToggleReminder = (days: number) => {
    setSelectedReminders((prev) =>
      prev.includes(days) ? prev.filter((d) => d !== days) : [...prev, days],
    );
  };

  const handleDownloadICS = () => {
    const icsContent = generateICS(
      `${record.label}.eth`,
      record.expiryTime,
      selectedReminders,
    );
    downloadICS(icsContent, `${record.label}.eth-renewal.ics`);
    onClose();
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(
      `${record.label}.eth`,
      record.expiryTime,
    );
    window.open(url, "_blank");
    onClose();
  };

  const REMINDER_OPTIONS = [
    { label: t("transaction.reminder.opt.1m"), value: 30 },
    { label: t("transaction.reminder.opt.1w"), value: 7 },
    { label: t("transaction.reminder.opt.3d"), value: 3 },
    { label: t("transaction.reminder.opt.1d"), value: 1 },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      title={
        <>
          <FontAwesomeIcon icon={faBell} className="text-link" />
          <span>{t("transaction.reminder.title")}</span>
        </>
      }
    >
      <div className="p-6 space-y-6">
        <div className="-mt-4 mb-2">
          <p className="text-gray-500 text-sm font-qs-medium">
            {record.label}.eth
          </p>
        </div>

        <div className="bg-orange-50/50 rounded-lg p-3 border border-orange-100 text-center">
          <span className="text-xs text-orange-600 uppercase font-qs-semibold tracking-wider block mb-1">
            {t("transaction.reminder.expiration_date")}
          </span>
          <span className="text-orange-900 font-qs-semibold">
            {formatExpiry(record.expiryTime)}
          </span>
        </div>

        <div>
          <label className="text-xs font-qs-semibold text-gray-400 uppercase tracking-wider mb-3 block">
            {t("transaction.reminder.remind_before")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {REMINDER_OPTIONS.map((opt) => {
              const isSelected = selectedReminders.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => handleToggleReminder(opt.value)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-qs-medium transition-all border
                    ${
                      isSelected
                        ? "bg-link text-white border-link shadow-sm shadow-link/20"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 flex flex-col gap-3">
        <button
          onClick={handleDownloadICS}
          disabled={selectedReminders.length === 0}
          className="w-full py-3 bg-text-main/90 text-white rounded-lg font-qs-semibold text-sm hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
        >
          <FontAwesomeIcon icon={faDownload} />
          {t("transaction.reminder.btn.download")}
        </button>

        <button
          onClick={handleGoogleCalendar}
          className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-qs-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faGoogle} className="text-red-500" />
          {t("transaction.reminder.btn.google")}
        </button>
      </div>
    </BaseModal>
  );
};
