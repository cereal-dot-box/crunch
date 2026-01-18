import { userResolvers } from './user.js';
import type { Resolvers } from '../types.generated.js';

export const resolvers: Resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
};

export type { Context } from './user.js';
