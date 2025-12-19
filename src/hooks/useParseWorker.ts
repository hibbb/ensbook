import { useEffect, useRef, useState, useCallback } from "react";
// ⚡️ 注意：确保你的 worker 路径正确
import ParserWorker from "../workers/parser.worker?worker";
import type { ClassifiedInputs } from "../utils/parseInputs";

export function useParseWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 存储解析结果
  const [result, setResult] = useState<ClassifiedInputs | null>(null);

  // 2. 追踪最新的请求 ID
  const lastRequestId = useRef(0);

  useEffect(() => {
    // 初始化 Worker
    const worker = new ParserWorker();
    workerRef.current = worker;

    // 监听 Worker 消息
    worker.onmessage = (e: MessageEvent) => {
      const { type, payload, id } = e.data;

      // 竞态检查：如果不是最后一次发出的请求，直接忽略
      if (id !== lastRequestId.current) {
        return;
      }

      setIsParsing(false);

      if (type === "SUCCESS") {
        // ⚡️ 使用了 result 对应的 setter
        setResult(payload as ClassifiedInputs);
        setError(null);
      } else {
        setError(payload as string);
        setResult(null);
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  // 解析函数
  const parse = useCallback((text: string) => {
    if (!workerRef.current || !text.trim()) {
      setResult(null);
      return;
    }

    // 增加 ID 计数
    const currentId = lastRequestId.current + 1;
    lastRequestId.current = currentId;

    setIsParsing(true);

    // 发送消息
    workerRef.current.postMessage({ text, id: currentId });
  }, []);

  return {
    parse,
    result, // 暴露给组件渲染列表
    isParsing, // 暴露给组件显示加载动画
    error, // 暴露给组件显示错误提示
  };
}
