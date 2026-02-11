// src/services/storage/registration.ts

import {
  type RegistrationState,
  type RegistrationStruct,
} from "../../types/ensRegistration";

const STORAGE_KEY_REG_PREFIX = "ens-reg-state-";
const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24小时过期
const isBrowser = () => typeof window !== "undefined";
const getRegKey = (label: string) => `${STORAGE_KEY_REG_PREFIX}${label}`;

const bigIntReplacer = (_: string, v: unknown) =>
  typeof v === "bigint" ? v.toString() : v;

interface SerializedRegistrationState extends Omit<
  RegistrationState,
  "registration"
> {
  registration?: Omit<RegistrationStruct, "duration"> & {
    duration: string | bigint;
    value?: string | bigint;
  };
}

const restoreBigInts = (
  data: SerializedRegistrationState,
): RegistrationState => {
  if (data.registration) {
    // 强制转换已知字段，并进行运行时类型检查
    if (typeof data.registration.duration === "string") {
      data.registration.duration = BigInt(data.registration.duration);
    }
    // 处理可选的 value 字段
    if (
      data.registration.value &&
      typeof data.registration.value === "string"
    ) {
      data.registration.value = BigInt(data.registration.value);
    }
  }
  // 断言返回完整类型（此时内部 BigInt 已恢复）
  return data as RegistrationState;
};

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

    const parsed = JSON.parse(serialized) as SerializedRegistrationState;

    const data = restoreBigInts(parsed);

    if (Date.now() - (data.timestamp || 0) > EXPIRATION_MS) {
      removeRegistrationState(label);
      return null;
    }

    return data;
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

/**
 * 获取所有挂起的注册标签，增加有效性检查
 * 1. 必须未过期
 * 2. 必须包含 commitTxHash 或 regTxHash (证明交易已发出)
 * 如果只有 registration 参数但没有 Hash，说明用户在钱包签名阶段取消了，
 * 这种状态无法“继续”，只能“重来”，因此不应视为 Pending。
 */
export function getAllPendingLabels(): Set<string> {
  if (!isBrowser()) return new Set();
  const pending = new Set<string>();

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_REG_PREFIX)) {
        const label = key.replace(STORAGE_KEY_REG_PREFIX, "");
        const state = getRegistrationState(label);

        // 核心过滤逻辑
        if (state) {
          // 只有当存在链上交易哈希时，才认为是有效的“断点”
          const hasChainInteraction = !!state.commitTxHash || !!state.regTxHash;

          if (hasChainInteraction) {
            pending.add(label);
          } else {
            // 可选：如果发现是无效的死数据（比如 create 了一半），可以在这里静默清理
            // removeRegistrationState(label);
          }
        }
      }
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("获取挂起任务失败:", error);
  }

  return pending;
}
