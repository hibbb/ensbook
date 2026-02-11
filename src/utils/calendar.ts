// src/utils/calendar.ts

import i18n from "../i18n/config";

/**
 * 格式化日期为 ICS 格式 (YYYYMMDDTHHMMSSZ)
 * 使用 UTC 时间，去除标点和毫秒
 */
const formatDateToICS = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

export const generateICS = (
  name: string,
  expiryTimestamp: number,
  reminders: number[] = [30, 7],
): string => {
  const expiryDate = new Date(expiryTimestamp * 1000);
  const now = new Date();
  const uid = `${name}-${now.getTime()}@ensbook.xyz`;
  const dtStamp = formatDateToICS(now);
  const dtStart = formatDateToICS(expiryDate);
  const dtEnd = formatDateToICS(new Date(expiryTimestamp * 1000 + 3600 * 1000));

  const summary = i18n.t("calendar.summary", { name });

  const description = i18n.t("calendar.description", {
    name,
    date: expiryDate.toLocaleString(),
  });

  const alarms = reminders
    .map((days) => {
      const alarmDesc = i18n.t("calendar.alarm_desc", { name, days });

      // 优化：使用 CRLF (\r\n) 符合 RFC 5545 标准
      return [
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${alarmDesc}`,
        `TRIGGER:-P${days}D`,
        "END:VALARM",
      ].join("\r\n");
    })
    .join("\r\n");

  // 优化：整体使用 CRLF 拼接
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ENSBook//ENS Renewal Reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `URL:https://app.ens.domains/${name}`,
    "STATUS:CONFIRMED",
    alarms, // 嵌入报警块
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsLines.join("\r\n");
};

export const generateGoogleCalendarUrl = (
  name: string,
  expiryTimestamp: number,
): string => {
  const expiryDate = new Date(expiryTimestamp * 1000);
  const start = formatDateToICS(expiryDate);
  const end = formatDateToICS(new Date(expiryTimestamp * 1000 + 3600 * 1000));

  const text = encodeURIComponent(i18n.t("calendar.summary", { name }));

  const details = encodeURIComponent(
    i18n.t("calendar.description", {
      name,
      date: expiryDate.toLocaleString(),
    }),
  );

  const location = encodeURIComponent("ENS Protocol");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
};

export const downloadICS = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
