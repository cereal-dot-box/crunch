import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3000/graphql',
  documents: ['src/**/*.ts'],
  generates: {
    'src/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        scalars: {
          ID: 'string',
          Int: 'number',
          Float: 'number',
          Boolean: 'boolean',
          String: 'string',
        },
        optionalType: 'undefined',
        skipTypename: true,
      },
    },
  },
};

export default config;
