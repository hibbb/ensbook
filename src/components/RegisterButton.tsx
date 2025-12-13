import { useEnsRegistration } from "../hooks/useEnsRegistration";

export const RegisterButton = ({
  label,
  durationYear,
}: {
  label: string;
  durationYear: number;
}) => {
  const { status, secondsLeft, startRegistration, isBusy } =
    useEnsRegistration();

  const handleRegister = () => {
    // 转换年为秒 (bigint)
    const durationSeconds = BigInt(durationYear * 365 * 24 * 60 * 60);
    startRegistration(label, durationSeconds);
  };

  // 根据状态动态显示按钮文本
  const getButtonText = () => {
    switch (status) {
      case "committing":
        return "请在钱包确认 Commit...";
      case "waiting_commit":
        return "Commit 上链中...";
      case "counting_down":
        return `等待 ENS 冷却 (${secondsLeft}s)`;
      case "registering":
        return "请在钱包确认 Register...";
      case "waiting_register":
        return "最终注册上链中...";
      case "success":
        return "注册成功！";
      case "error":
        return "重试";
      default:
        return "注册";
    }
  };

  return (
    <button
      onClick={handleRegister}
      disabled={isBusy}
      className={`btn ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {getButtonText()}
    </button>
  );
};
