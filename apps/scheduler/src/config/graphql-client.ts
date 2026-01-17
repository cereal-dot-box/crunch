import { GraphQLClient } from 'graphql-request';
import { getEnv } from './env';

let graphqlClient: GraphQLClient | null = null;

export function getGraphQLClient(): GraphQLClient {
  if (!graphqlClient) {
    const env = getEnv();
    // Use BACKEND_URL from env (default http://localhost:3000)
    const graphqlUrl = env.BACKEND_URL.replace(/\/$/, '') + '/graphql';
    graphqlClient = new GraphQLClient(graphqlUrl);
  }
  return graphqlClient;
}
