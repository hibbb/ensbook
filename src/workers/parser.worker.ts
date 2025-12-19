// src/workers/parser.worker.ts

// 1. 引入原本运行在主线程的纯逻辑函数
import { parseAndClassifyInputs } from "../utils/parseInputs";

// 2. 监听主线程发来的消息
self.onmessage = (e: MessageEvent<{ text: string; id: number }>) => {
  const { text, id } = e.data; // 接收 ID

  try {
    const result = parseAndClassifyInputs(text);
    // 回传 ID
    self.postMessage({ type: "SUCCESS", payload: result, id });
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: (error as Error).message,
      id,
    });
  }
};
