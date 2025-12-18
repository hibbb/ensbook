import { type RegistrationState } from "../../types/ensRegistration";

const STORAGE_KEY_REG_PREFIX = "ens-reg-state-";

const isBrowser = () => typeof window !== "undefined";

const bigIntReplacer = (_: string, v: unknown) =>
  typeof v === "bigint" ? v.toString() : v;

const getRegKey = (label: string) => `${STORAGE_KEY_REG_PREFIX}${label}`;

// 简单的深拷贝合并
function mergeState(
  oldState: Partial<RegistrationState>,
  newState: Partial<RegistrationState>,
): Partial<RegistrationState> {
  return {
    ...oldState,
    ...newState,
    registration:
      oldState.registration || newState.registration
        ? { ...oldState.registration, ...newState.registration }
        : undefined,
    timestamp: Date.now(),
  } as Partial<RegistrationState>;
}

export function saveRegistrationState(
  label: string,
  state: Partial<RegistrationState>,
) {
  if (!isBrowser()) return;
  try {
    const key = getRegKey(label);
    const existingStr = localStorage.getItem(key);
    let existingData: Partial<RegistrationState> = {};

    if (existingStr) {
      existingData = JSON.parse(existingStr);
    }
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
    // 恢复 BigInt
    if (data.registration && typeof data.registration.duration === "string") {
      data.registration.duration = BigInt(data.registration.duration);
    }
    return data as RegistrationState;
  } catch (error) {
    console.warn(`[Storage] 读取注册状态失败 [${label}]:`, error);
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
