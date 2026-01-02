// src/utils/calendar.ts

/**
 * 格式化日期为 ICS 格式 (YYYYMMDDTHHMMSSZ)
 */
const formatDateToICS = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

/**
 * 生成 .ics 文件内容
 * @param domain 域名 (例如: benben.eth)
 * @param expiryTimestamp 到期时间戳 (秒)
 * @param reminders 提前提醒的天数数组 (默认: [30, 7] -> 提前30天和7天)
 */
export const generateICS = (
  domain: string,
  expiryTimestamp: number,
  reminders: number[] = [30, 7],
): string => {
  const expiryDate = new Date(expiryTimestamp * 1000);
  const now = new Date();
  const uid = `${domain}-${now.getTime()}@ensbook.com`;
  const dtStamp = formatDateToICS(now);

  // 事件开始时间：到期时间
  const dtStart = formatDateToICS(expiryDate);
  // 事件结束时间：到期时间后 1 小时 (日历事件通常需要一个区间)
  const dtEnd = formatDateToICS(new Date(expiryTimestamp * 1000 + 3600 * 1000));

  const summary = `[ENS] ${domain} 续费提醒`;
  const description = `您的 ENS 域名 ${domain} 将于 ${expiryDate.toLocaleString()} 到期。\n请及时续费以防止域名被释放。\n\n管理链接: https://app.ens.domains/${domain}`;

  // 构建 VALARM (提醒) 块
  const alarms = reminders
    .map((days) => {
      return `
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:${domain} 将于 ${days} 天后到期
TRIGGER:-P${days}D
END:VALARM`.trim();
    })
    .join("\n");

  // 构建完整的 ICS 内容
  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ENSBook//ENS Renewal Reminder//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${summary}
DESCRIPTION:${description}
URL:https://app.ens.domains/${domain}
STATUS:CONFIRMED
${alarms}
END:VEVENT
END:VCALENDAR
`.trim();

  return icsContent;
};

/**
 * 生成 Google Calendar Web Intent URL
 */
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

/**
 * 触发下载 .ics 文件
 */
export const downloadICS = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
