import { type NameRecord } from "../../types/ensNames";

const STORAGE_KEY_NAME_RECORDS = "ens_name_records";

const isBrowser = () => typeof window !== "undefined";
const bigIntReplacer = (_: string, v: unknown) =>
  typeof v === "bigint" ? v.toString() : v;

export function getNameRecords(): NameRecord[] | null {
  if (!isBrowser()) return null;
  try {
    const serialized = localStorage.getItem(STORAGE_KEY_NAME_RECORDS);
    if (!serialized) return null;
    const parsed = JSON.parse(serialized);
    return Array.isArray(parsed) ? (parsed as NameRecord[]) : null;
  } catch (error) {
    console.warn("[Storage] 读取名称列表失败:", error);
    return null;
  }
}

export function saveNameRecords(records: NameRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(
      STORAGE_KEY_NAME_RECORDS,
      JSON.stringify(records, bigIntReplacer),
    );
  } catch (error) {
    console.warn("[Storage] 保存名称列表失败:", error);
  }
}

export function clearNameRecords(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY_NAME_RECORDS);
  } catch (error) {
    console.warn("[Storage] 清空名称列表失败:", error);
  }
}
