// src/utils/format.ts

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
