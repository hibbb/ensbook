// src/components/ProcessModal/useProcessForm.ts

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isAddress, type Address } from "viem";
import { normalize } from "viem/ens";
import { publicClient } from "../../utils/client";
import {
  MIN_REGISTRATION_DURATION,
  SECONDS_PER_DAY,
  SECONDS_PER_YEAR,
} from "../../config/constants";

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

interface UseProcessFormProps {
  isOpen: boolean;
  type: "register" | "renew" | "batch";
  currentExpiry?: number;
  expiryTimes?: number[];
  itemCount: number;
}

export const useProcessForm = ({
  isOpen,
  type,
  currentExpiry,
  expiryTimes = [],
  itemCount,
}: UseProcessFormProps) => {
  const { t } = useTranslation();

  const [mode, setMode] = useState<"duration" | "until">("duration");
  const [years, setYears] = useState(1);
  const [days, setDays] = useState(0);
  const [targetDate, setTargetDate] = useState("");

  const [recipientInput, setRecipientInput] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState<Address | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const getBaseTime = useCallback(() => {
    if (type === "renew" || type === "batch") {
      if (expiryTimes.length > 0) return Math.min(...expiryTimes);
      return currentExpiry || Math.floor(Date.now() / 1000);
    }
    return Math.floor(Date.now() / 1000);
  }, [type, currentExpiry, expiryTimes]);

  // 初始化
  useEffect(() => {
    if (isOpen) {
      setMode("duration");
      setYears(1);
      setDays(0);
      setRecipientInput("");
      setResolvedAddress(null);
      setResolveError(null);
      setIsResolving(false);

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

  // 核心逻辑：监听输入并解析 (带防抖)
  useEffect(() => {
    const input = recipientInput.trim();

    // 1. 空输入：重置，视为使用当前钱包
    if (!input) {
      setResolvedAddress(null);
      setResolveError(null);
      setIsResolving(false);
      return;
    }

    // 2. 如果是标准地址：直接通过
    if (isAddress(input)) {
      setResolvedAddress(input);
      setResolveError(null);
      setIsResolving(false);
      return;
    }

    // 3. 如果看起来像 ENS (包含点)：发起异步解析
    if (input.includes(".")) {
      setIsResolving(true);
      setResolveError(null);
      setResolvedAddress(null); // 先清空，防止提交旧的

      const timer = setTimeout(async () => {
        try {
          const normalized = normalize(input);
          const addr = await publicClient.getEnsAddress({ name: normalized });

          if (addr) {
            setResolvedAddress(addr);
            setResolveError(null);
          } else {
            setResolvedAddress(null);
            setResolveError("ENS name not found"); // 简单提示，UI层可以翻译
          }
        } catch (e) {
          setResolvedAddress(null);
          setResolveError("Invalid ENS name");
          console.log(e);
        } finally {
          setIsResolving(false);
        }
      }, 500); // 500ms 防抖

      return () => clearTimeout(timer);
    }

    // 4. 既不是地址也不是 ENS：报错
    setResolvedAddress(null);
    setResolveError("Invalid format");
    setIsResolving(false);
  }, [recipientInput]);

  const minDateValue = useMemo(() => {
    const now = new Date();
    const todayStr = formatDateInput(now);
    if (type === "register") return todayStr;

    const minExpiry = getBaseTime();
    const minDate = new Date(minExpiry * 1000);
    return minDate > now ? formatDateInput(minDate) : todayStr;
  }, [type, getBaseTime]);

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

  const skippedCount = useMemo(() => {
    if (mode !== "until" || type !== "batch") return 0;
    return calculatedDurations.filter((d) => d <= 0n).length;
  }, [calculatedDurations, mode, type]);

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

    if (type === "register" && recipientInput.trim() !== "") {
      if (isResolving) return t("common.loading"); // 正在解析中，暂不报错，但也阻止提交
      if (resolveError || !resolvedAddress) {
        return t("transaction.error.invalid_address");
      }
    }

    return null;
  }, [
    calculatedDurations,
    type,
    t,
    recipientInput,
    isResolving,
    resolveError,
    resolvedAddress,
  ]);

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
    recipientInput,
    setRecipientInput,
    resolvedAddress,
    isResolving,
    resolveError,
  };
};
