// src/services/graph/client.ts
import {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink,
  type DocumentNode,
} from "@apollo/client";
import { SUBGRAPH_API_KEY } from "../../config/env";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

/**
 * 🚀 创建全局公用客户端 (Public Client)
 * 用于执行 getEnsName (反向解析) 等 RPC 调用
 */
export const publicClient = createPublicClient({
  chain: mainnet, // 默认连接主网
  transport: http(), // 可以在此处填入 Alchemy/Infura 的 RPC URL 提高稳定性
  batch: {
    multicall: true, // 🚀 开启自动批处理，优化 Promise.all 的性能
  },
});

export interface GraphQLQueryCode {
  str: string;
  vars: Record<string, unknown>;
}

const MAINNET_SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`;

let apolloClientInstance: ApolloClient | null = null;

function getApolloClient(): ApolloClient {
  if (!apolloClientInstance) {
    apolloClientInstance = new ApolloClient({
      link: new HttpLink({ uri: MAINNET_SUBGRAPH_URL }),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: { fetchPolicy: "network-only" },
        watchQuery: { fetchPolicy: "network-only" },
      },
    });
  }
  return apolloClientInstance!;
}

export async function queryData(queryCode: GraphQLQueryCode): Promise<unknown> {
  try {
    const client = getApolloClient();
    const queryDocument: DocumentNode = gql(queryCode.str);
    const queryResult = await client.query({
      query: queryDocument,
      variables: queryCode.vars,
    });
    return queryResult.data;
  } catch (error) {
    console.error("GraphQL 获取数据失败:", JSON.stringify(error, null, 2));
    throw error;
  }
}
