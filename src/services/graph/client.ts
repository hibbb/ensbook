// src/services/graph/client.ts
import {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink,
  type DocumentNode,
} from "@apollo/client";
import { SUBGRAPH_URL } from "../../config/env";

export interface GraphQLQueryCode {
  str: string;
  vars: Record<string, unknown>;
}

let apolloClientInstance: ApolloClient | null = null;

function getApolloClient(): ApolloClient {
  if (!apolloClientInstance) {
    apolloClientInstance = new ApolloClient({
      link: new HttpLink({ uri: SUBGRAPH_URL }),
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
