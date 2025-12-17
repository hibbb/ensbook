import React, { useState } from "react";
import { useEnsRegistration } from "./hooks/useEnsRegistration";

export const TestBox = () => {
  const [label, setLabel] = useState("");

  // 1. 获取 Hook 暴露的属性和方法
  const { status, secondsLeft, startRegistration, isBusy } =
    useEnsRegistration();

  // 2. 定义处理函数
  const handleRegister = async () => {
    if (!label) return;

    // 注册时长：单位为秒。通常 1年 ≈ 31536000n
    const DURATION_28D_1H = 2422800n;

    await startRegistration(label, DURATION_28D_1H);
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc" }}>
      <h3>ENS 注册示例</h3>

      <input
        type="text"
        placeholder="输入要注册的 Label (如: alice)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        disabled={isBusy}
      />

      <button onClick={handleRegister} disabled={isBusy || !label}>
        {isBusy ? "处理中..." : "开始注册 .eth"}
      </button>

      {/* 3. 根据状态机展示用户反馈 */}
      <div style={{ marginTop: "15px" }}>
        {status === "committing" && <p>🟡 请在钱包中确认 Commit 交易...</p>}
        {status === "waiting_commit" && <p>🔵 Commit 交易打包中...</p>}

        {status === "counting_down" && (
          <p style={{ color: "orange" }}>
            ⏳ 安全倒计时：请等待 <strong>{secondsLeft}</strong> 秒以防止抢注...
          </p>
        )}

        {status === "registering" && <p>🟡 请在钱包中确认最终注册交易...</p>}
        {status === "waiting_register" && <p>🔵 正在同步链上所有权...</p>}

        {status === "success" && (
          <p style={{ color: "green" }}>✅ 注册成功！</p>
        )}
        {status === "error" && (
          <p style={{ color: "red" }}>❌ 注册失败，请检查控制台。</p>
        )}
      </div>
    </div>
  );
};
