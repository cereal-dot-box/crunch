import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'edit-this',
  documents: [
    'edit-this',
  ],
  generates: {
    'src/graphql/': {
      preset: 'client-preset',
      presetConfig: {
        fragmentMasking: 'disable',
      },
      config: {
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
