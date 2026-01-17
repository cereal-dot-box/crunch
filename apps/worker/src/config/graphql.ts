import { GraphQLClient } from 'graphql-request';
import { getEnv } from './env';
import { getServiceToken } from '../lib/jwt';

let graphqlClient: GraphQLClient | null = null;

export function getGraphQLClient(): GraphQLClient {
  if (!graphqlClient) {
    const env = getEnv();

    graphqlClient = new GraphQLClient(env.BACKEND_GRAPHQL_URL, {
      // Dynamically fetch the token for each request
      requestMiddleware: async (request) => {
        const token = await getServiceToken();
        return {
          ...request,
          headers: {
            ...request.headers,
            Authorization: `Bearer ${token}`,
          },
        };
      },
    });
  }
  return graphqlClient;
}
