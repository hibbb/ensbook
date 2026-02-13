// src/utils/client.ts
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { ALCHEMY_API_KEY } from "../config/env";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  batch: {
    multicall: true, // 开启 multicall 可以显著减少 HTTP 请求次数
  },
});
