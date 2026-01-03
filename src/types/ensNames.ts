// src/types/ensNames.ts

export interface NameRecord {
  readonly label: string;
  readonly namehash: string; // 通常为域名全称的节点哈希，如 namehash('alice.eth')
  readonly labelhash: string; // 该 label 对应的哈希值，如 keccak256(toUtf8Bytes('alice'))
  readonly length: number; // 域名长度，如 'alice.eth' 的长度为 5

  /**
   * 域名状态：
   * - Active: 正常使用中
   * - Grace: 宽限期
   * - Premium: 溢价期
   * - Released: 已被释放
   * - Available: 未注册 (明确确认未注册)
   * - Unknown: 状态未知 (网络错误或数据缺失)
   */
  status: "Active" | "Grace" | "Premium" | "Released" | "Available" | "Unknown";
  wrapped: boolean;
  owner: string | null;
  ownerPrimaryName?: string;

  registeredTime: number;
  expiryTime: number;
  releaseTime: number;

  level: number;
  memo?: string;
}
