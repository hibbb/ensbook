// src/types/ensNames.ts

export interface NameRecord {
  readonly label: string;
  readonly namehash: string; // 通常为域名全称的节点哈希，如 namehash('alice.eth')
  readonly labelhash: string; // 该 label 对应的哈希值，如 keccak256(toUtf8Bytes('alice'))
  readonly length: number; // 域名长度，如 'alice.eth' 的长度为 5

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
