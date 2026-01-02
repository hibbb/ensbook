// src/utils/calendar.ts

/**
 * 格式化日期为 ICS 格式 (YYYYMMDDTHHMMSSZ)
 * 使用 UTC 时间，去除标点和毫秒
 */
const formatDateToICS = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

export const generateICS = (
  domain: string,
  expiryTimestamp: number,
  reminders: number[] = [30, 7],
): string => {
  const expiryDate = new Date(expiryTimestamp * 1000);
  const now = new Date();
  const uid = `${domain}-${now.getTime()}@ensbook.com`;
  const dtStamp = formatDateToICS(now);
  const dtStart = formatDateToICS(expiryDate);
  const dtEnd = formatDateToICS(new Date(expiryTimestamp * 1000 + 3600 * 1000));

  const summary = `[ENS] ${domain} 续费提醒`;
  // 🚀 优化：使用 \n 统一换行，但为了更好的兼容性，部分旧客户端可能需要转义
  const description = `您的 ENS 域名 ${domain} 将于 ${expiryDate.toLocaleString()} 到期。\\n请及时续费以防止域名被释放。\\n\\n管理链接: https://app.ens.domains/${domain}`;

  const alarms = reminders
    .map((days) => {
      // 🚀 优化：使用 CRLF (\r\n) 符合 RFC 5545 标准
      return [
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${domain} 将于 ${days} 天后到期`,
        `TRIGGER:-P${days}D`,
        "END:VALARM",
      ].join("\r\n");
    })
    .join("\r\n");

  // 🚀 优化：整体使用 CRLF 拼接
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
    `URL:https://app.ens.domains/${domain}`,
    "STATUS:CONFIRMED",
    alarms, // 嵌入报警块
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsLines.join("\r\n");
};

// ... generateGoogleCalendarUrl 和 downloadICS 保持不变
export const generateGoogleCalendarUrl = (
  domain: string,
  expiryTimestamp: number,
): string => {
  const expiryDate = new Date(expiryTimestamp * 1000);
  const start = formatDateToICS(expiryDate);
  const end = formatDateToICS(new Date(expiryTimestamp * 1000 + 3600 * 1000));

  const text = encodeURIComponent(`[ENS] ${domain} 续费提醒`);
  const details = encodeURIComponent(
    `您的 ENS 域名 ${domain} 将于 ${expiryDate.toLocaleString()} 到期。\n请及时续费。\n\n管理链接: https://app.ens.domains/${domain}`,
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
