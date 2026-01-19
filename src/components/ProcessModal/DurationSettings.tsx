import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCalendarDay,
  faMinus,
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

interface DurationSettingsProps {
  mode: "duration" | "until";
  setMode: (m: "duration" | "until") => void;
  years: number;
  setYears: (y: number) => void;
  days: number;
  setDays: (d: number) => void;
  targetDate: string;
  setTargetDate: (d: string) => void;
  minDateValue: string;
  skippedCount: number;
  type: "register" | "renew" | "batch";
}

export const DurationSettings = ({
  mode,
  setMode,
  years,
  setYears,
  days,
  setDays,
  targetDate,
  setTargetDate,
  minDateValue,
  skippedCount,
  type,
}: DurationSettingsProps) => {
  const { t } = useTranslation();

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      {/* Mode Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setMode("duration")}
          className={`flex-1 py-2 text-sm font-qs-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
            mode === "duration"
              ? "bg-white text-link shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FontAwesomeIcon icon={faClock} />
          {t("transaction.mode.duration")}
        </button>
        <button
          onClick={() => setMode("until")}
          className={`flex-1 py-2 text-sm font-qs-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
            mode === "until"
              ? "bg-white text-link shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FontAwesomeIcon icon={faCalendarDay} />
          {t("transaction.mode.until")}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        {mode === "duration" ? (
          <div className="flex items-center gap-4">
            {/* Years Input */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 w-full justify-center">
                <button
                  onClick={() => setYears(Math.max(0, years - 1))}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faMinus} size="xs" />
                </button>
                <div className="flex-1 relative min-w-[60px]">
                  <input
                    type="number"
                    min="0"
                    value={years}
                    onChange={(e) =>
                      setYears(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full text-center text-2xl font-qs-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-link transition-colors appearance-none m-0 p-0"
                  />
                  <span className="block text-center text-xs text-gray-400 font-qs-medium mt-1">
                    {t("common.year")}
                  </span>
                </div>
                <button
                  onClick={() => setYears(years + 1)}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" />
                </button>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-100"></div>
            {/* Days Input */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 w-full justify-center">
                <button
                  onClick={() => setDays(Math.max(0, days - 1))}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faMinus} size="xs" />
                </button>
                <div className="flex-1 relative min-w-[60px]">
                  <input
                    type="number"
                    min="0"
                    value={days}
                    onChange={(e) =>
                      setDays(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full text-center text-2xl font-qs-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-link transition-colors appearance-none m-0 p-0"
                  />
                  <span className="block text-center text-xs text-gray-400 font-qs-medium mt-1">
                    {t("common.day")}
                  </span>
                </div>
                <button
                  onClick={() => setDays(days + 1)}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-link hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-qs-bold text-gray-400 uppercase tracking-wider">
              {t("transaction.mode.until")}
            </label>
            <input
              type="date"
              value={targetDate}
              min={minDateValue}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-lg font-qs-medium text-text-main outline-none focus:ring-2 focus:ring-link/20 focus:border-link transition-all"
            />
            {type === "batch" && (
              <p className="text-xs text-gray-400 mt-1">
                {t("transaction.mode.until_desc_batch")}
              </p>
            )}
            {skippedCount > 0 && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-orange-50 border border-orange-100 rounded-md text-orange-600 text-xs font-qs-medium animate-in fade-in slide-in-from-top-1">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mt-0.5"
                />
                <span>
                  {t("transaction.mode.partial_skip", { count: skippedCount })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
