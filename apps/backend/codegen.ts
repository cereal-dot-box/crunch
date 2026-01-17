import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/graphql/schema.graphql',
  generates: {
    'src/graphql/types.generated.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../graphql/resolvers#Context',
        mappers: {},
        scalars: {
          ID: 'string',
          Int: 'number',
          Float: 'number',
          Boolean: 'boolean',
          String: 'string',
        },
        useIndexSignature: true,
        optionalType: 'undefined',
      },
    },
  },
};

export default config;
