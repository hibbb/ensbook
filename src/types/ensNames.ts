// src/types/ensNames.ts

export interface NameRecord {
  readonly label: string;
  readonly tokenId: string;
  length: number;
  level: number; // 用户标记等级，默认 1
  /**
   * 域名状态：
   * - Active: 正常使用中
   * - GracePeriod: 宽限期
   * - PremiumPeriod: 溢价期
   * - Released: 已被释放
   * - Available: 未注册
   */
  status: "Active" | "GracePeriod" | "PremiumPeriod" | "Released" | "Available";
  wrapped: boolean;
  owner: string | null;

  registeredTime: number; // 注册时间 (Unix)
  expiryTime: number; // 到期时间 (Unix)
  releaseTime: number; // 释放/进入溢价期时间 (Unix)
}
