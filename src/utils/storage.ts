import { type RegistrationState, type NameRecords } from "../types/ens";

// ============================================================================
// 1. 常量与配置
// ============================================================================

const STORAGE_KEY_REG_PREFIX = "ens-reg-state-";
const STORAGE_KEY_NAME_RECORDS = "ens_name_records";

// ============================================================================
// 2. 核心工具函数
// ============================================================================

/**
 * 基础环境检查 (SSR 安全)
 */
const isBrowser = () => typeof window !== "undefined";

/**
 * JSON 序列化 replacer: 将 BigInt 转换为 String 存储
 */
const bigIntReplacer = (_: string, v: unknown) =>
  typeof v === "bigint" ? v.toString() : v;

/**
 * 简单的深拷贝/合并辅助函数 (针对 RegistrationState 这种特定层级结构)
 * 防止直接 spread 导致嵌套对象丢失
 */
function mergeState(
  oldState: Partial<RegistrationState>,
  newState: Partial<RegistrationState>,
): Partial<RegistrationState> {
  return {
    ...oldState,
    ...newState,
    // 如果双方都有 registration 对象，则进行合并，而不是直接覆盖
    registration:
      oldState.registration || newState.registration
        ? { ...oldState.registration, ...newState.registration }
        : undefined,
    timestamp: Date.now(),
  } as Partial<RegistrationState>;
}

// ============================================================================
// 3. 注册流程状态管理 (Registration State)
// ============================================================================

const getRegKey = (label: string) => `${STORAGE_KEY_REG_PREFIX}${label}`;

export function saveRegistrationState(
  label: string,
  state: Partial<RegistrationState>,
) {
  if (!isBrowser()) return;

  try {
    const key = getRegKey(label);
    const existingStr = localStorage.getItem(key);

    // 显式声明类型，避免 TS 推断为 {}
    let existingData: Partial<RegistrationState> = {};

    if (existingStr) {
      existingData = JSON.parse(existingStr);
    }

    // 使用合并逻辑
    const finalState = mergeState(existingData, state);

    localStorage.setItem(key, JSON.stringify(finalState, bigIntReplacer));
  } catch (error) {
    console.warn(`[Storage] 保存注册状态失败 [${label}]:`, error);
  }
}

export function getRegistrationState(label: string): RegistrationState | null {
  if (!isBrowser()) return null;

  try {
    const key = getRegKey(label);
    const serialized = localStorage.getItem(key);
    if (!serialized) return null;

    const data = JSON.parse(serialized);

    // 🛡️ 防御性编程：手动恢复 BigInt 字段
    // 注意：如果 RegistrationStruct 增加了新的 bigint 字段，必须在此处添加恢复逻辑
    if (data.registration) {
      if (typeof data.registration.duration === "string") {
        data.registration.duration = BigInt(data.registration.duration);
      }
      // 可以在这里添加其他需要恢复的字段...
    }

    return data as RegistrationState;
  } catch (error) {
    console.warn(`[Storage] 读取注册状态失败 [${label}]:`, error);
    // 如果读取失败（例如数据损坏），返回 null 让前端重新开始，比报错更好
    return null;
  }
}

export function removeRegistrationState(label: string) {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(getRegKey(label));
  } catch (error) {
    console.warn(`[Storage] 删除注册状态失败 [${label}]:`, error);
  }
}

// ============================================================================
// 4. 域名列表管理 (Name Records)
// ============================================================================

/**
 * 获取名称记录列表
 */
export function getNameRecords(): NameRecords | null {
  if (!isBrowser()) return null;

  try {
    const serialized = localStorage.getItem(STORAGE_KEY_NAME_RECORDS);
    if (!serialized) return null;

    const parsed = JSON.parse(serialized);

    // 简单校验格式
    return Array.isArray(parsed) ? (parsed as NameRecords) : null;
  } catch (error) {
    console.warn("[Storage] 读取名称列表失败:", error);
    return null;
  }
}

/**
 * 保存名称记录列表
 */
export function saveNameRecords(records: NameRecords): void {
  if (!isBrowser()) return;

  try {
    // 即使 NameRecords 目前可能不包含 bigint，使用 replacer 也是一种面向未来的安全习惯
    localStorage.setItem(
      STORAGE_KEY_NAME_RECORDS,
      JSON.stringify(records, bigIntReplacer),
    );
  } catch (error) {
    console.warn("[Storage] 保存名称列表失败:", error);
  }
}

/**
 * 清空名称记录列表
 */
export function clearNameRecords(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY_NAME_RECORDS);
  } catch (error) {
    console.warn("[Storage] 清空名称列表失败:", error);
  }
}
