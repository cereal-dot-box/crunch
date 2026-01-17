import type { CodegenConfig } from '@graphql-codegen/cli';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: CodegenConfig = {
  schema: path.join(__dirname, '../../apps/backend/src/graphql/schema.graphql'),
  documents: [
    path.join(__dirname, 'src/graphql', '**', '*.graphql'),
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
