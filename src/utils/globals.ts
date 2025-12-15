import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import type { DocumentNode } from "@apollo/client";

export interface GraphQLQueryCode {
  str: string;
  // 这告诉 TS，vars 是一个键值对对象，但每个值在使用前必须被检查类型。
  vars: Record<string, unknown>;
}

// Mainnet Subgraph 配置与 Client 单例
const SUBGRAPH_API_KEY = import.meta.env.VITE_SUBGRAPH_API_KEY;

// 确保 API Key 存在，如果不存在，则抛出错误，这是健壮性原则的要求
if (!SUBGRAPH_API_KEY) {
  throw new Error(
    "缺少 VITE_SUBGRAPH_API_KEY 环境变量。请检查您的 .env.local 文件是否配置正确。",
  );
}

const MAINNET_SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`;

let apolloClientInstance: ApolloClient | null = null;

// 获取 ApolloClient 单例 (Mainnet)

function getApolloClient(): ApolloClient {
  // 如果尚未初始化
  if (!apolloClientInstance) {
    const httpLink = new HttpLink({
      uri: MAINNET_SUBGRAPH_URL,
    });

    // 初始化并赋值给单例变量
    apolloClientInstance = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        query: { fetchPolicy: "network-only" },
        watchQuery: { fetchPolicy: "network-only" },
      },
    });
  }

  // 此时 apolloClientInstance 保证非 null，使用非空断言操作符 (!)
  return apolloClientInstance!;
}

/**
 * queryData，从 Subgraph 查询数据的通用函数。
 * @param queryCode 包含查询字符串和变量的对象。
 * @returns GraphQL 查询结果的数据部分 (类型为 unknown)。
 */

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
