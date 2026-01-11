// src/utils/format.ts

/**
 * 格式化日期为 ICS 格式 (YYYYMMDDTHHMMSSZ)
 * 使用 UTC 时间，去除标点和毫秒
 */
export const formatDateToICS = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

/**
 * 🚀 预先配置好的日期格式化对象 (避免重复创建)
 */
export const zhCNTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/**
 * 格式化时间戳为中文日期字符串
 */
export const formatDate = (timestamp: number): string => {
  if (!timestamp) return "-";
  return zhCNTimeFormatter.format(new Date(timestamp * 1000));
};

/**
 * 截短以太坊地址或哈希字符串
 * @param address - 原始字符串 (0x...)
 * @param start - 开头保留长度 (默认 6)
 * @param end - 结尾保留长度 (默认 4)
 * @returns 格式化后的字符串 (e.g. "0x1234...5678")
 */
export const truncateAddress = (
  address: string | null | undefined,
  start = 6,
  end = 4,
): string => {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * 🚀 格式化大数字，添加 K/M 单位
 * @param n - 原始数字
 * @returns 格式化后的字符串 (e.g. "1.23K", "100M")
 */
export const displayNumber = (n: number) => {
  if (n < 0.9995) {
    return parseFloat(n.toFixed(3)).toString();
  }

  const i = n < 999.5 ? 0 : n < 999500 ? 1 : 2;
  const suffix = ["", "K", "M"][i];
  const scaled = n / [1, 1000, 1000000][i];

  const precision = scaled < 9.995 ? 2 : scaled < 99.95 ? 1 : 0;

  let result;
  if (precision > 0) {
    result = parseFloat(scaled.toFixed(precision)).toString();
  } else {
    result = scaled.toFixed(0);
  }

  return suffix ? `${result}${suffix}` : result;
};
