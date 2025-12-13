// src/types/ens.ts (或其他类型定义文件)

// 对应你提供的单个名称信息模板
export interface EnsNameRecord {
  label: string;
  length: number;
  level: number;
  status: "Normal" | "GracePeriod" | "Expired" | "Reserved"; // 明确状态类型
  tokenId: string; // Hex string
  wrapped: boolean;
  registrationTime: number; // Unix timestamp
  expiresTime: number; // Unix timestamp
  releaseTime: number; // Unix timestamp
  owner: string; // Address
}

// 对应整个列表的类型
export type EnsNameList = EnsNameRecord[];
