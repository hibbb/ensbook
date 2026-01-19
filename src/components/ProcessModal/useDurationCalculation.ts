import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MIN_REGISTRATION_DURATION,
  SECONDS_PER_DAY,
  SECONDS_PER_YEAR,
} from "../../config/constants";

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

interface UseDurationProps {
  isOpen: boolean;
  type: "register" | "renew" | "batch";
  currentExpiry?: number;
  expiryTimes?: number[];
  itemCount: number;
}

export const useDurationCalculation = ({
  isOpen,
  type,
  currentExpiry,
  expiryTimes = [],
  itemCount,
}: UseDurationProps) => {
  const { t } = useTranslation();

  const [mode, setMode] = useState<"duration" | "until">("duration");
  const [years, setYears] = useState(1);
  const [days, setDays] = useState(0);
  const [targetDate, setTargetDate] = useState("");

  // 1. 计算基准时间
  const getBaseTime = useCallback(() => {
    if (type === "renew" || type === "batch") {
      if (expiryTimes.length > 0) return Math.min(...expiryTimes);
      return currentExpiry || Math.floor(Date.now() / 1000);
    }
    return Math.floor(Date.now() / 1000);
  }, [type, currentExpiry, expiryTimes]);

  // 2. 初始化默认值
  useEffect(() => {
    if (isOpen) {
      setMode("duration");
      setYears(1);
      setDays(0);

      // 默认目标日期：基准时间 + 1年 (如果是批量，取最晚过期时间+1年)
      let baseForDefault = Math.floor(Date.now() / 1000);
      if (type === "batch" && expiryTimes.length > 0) {
        baseForDefault = Math.max(...expiryTimes);
      } else if (type === "renew" && currentExpiry) {
        baseForDefault = currentExpiry;
      }

      const defaultTarget = new Date(
        (baseForDefault + Number(SECONDS_PER_YEAR)) * 1000,
      );
      setTargetDate(formatDateInput(defaultTarget));
    }
  }, [isOpen, type, expiryTimes, currentExpiry]);

  // 3. 计算最小可选日期
  const minDateValue = useMemo(() => {
    const now = new Date();
    const todayStr = formatDateInput(now);
    if (type === "register") return todayStr;

    const minExpiry = getBaseTime();
    const minDate = new Date(minExpiry * 1000);
    return minDate > now ? formatDateInput(minDate) : todayStr;
  }, [type, getBaseTime]);

  // 4. 核心：计算时长数组
  const calculatedDurations = useMemo<bigint[]>(() => {
    if (mode === "duration") {
      const duration =
        BigInt(years) * BigInt(SECONDS_PER_YEAR) +
        BigInt(days) * BigInt(SECONDS_PER_DAY);
      return new Array(itemCount).fill(duration);
    } else {
      if (!targetDate) return new Array(itemCount).fill(0n);
      const targetTs = Math.floor(new Date(targetDate).getTime() / 1000);

      if (type === "register") {
        const now = Math.floor(Date.now() / 1000);
        const diff = targetTs - now;
        return new Array(itemCount).fill(diff > 0 ? BigInt(diff) : 0n);
      }

      if (expiryTimes.length > 0) {
        return expiryTimes.map((exp) => {
          const diff = targetTs - exp;
          return diff > 0 ? BigInt(diff) : 0n;
        });
      }
      return new Array(itemCount).fill(0n);
    }
  }, [mode, years, days, targetDate, itemCount, type, expiryTimes]);

  // 5. 统计被跳过的数量
  const skippedCount = useMemo(() => {
    if (mode !== "until" || type !== "batch") return 0;
    return calculatedDurations.filter((d) => d <= 0n).length;
  }, [calculatedDurations, mode, type]);

  // 6. 验证逻辑
  const validationError = useMemo(() => {
    const isAllInvalid = calculatedDurations.every((d) => d <= 0n);

    if (isAllInvalid) {
      return type === "renew" || type === "batch"
        ? t("transaction.error.before_expiry")
        : t("transaction.error.past_date");
    }

    if (type === "register") {
      const minDuration = BigInt(MIN_REGISTRATION_DURATION);
      if (calculatedDurations[0] < minDuration) {
        return t("transaction.error.min_duration");
      }
    }
    return null;
  }, [calculatedDurations, type, t]);

  return {
    mode,
    setMode,
    years,
    setYears,
    days,
    setDays,
    targetDate,
    setTargetDate,
    minDateValue,
    calculatedDurations,
    skippedCount,
    validationError,
  };
};
