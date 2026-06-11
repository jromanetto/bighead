//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    // Generated Supabase types — not authored by us, don't lint. public/ holds
    // plain-JS browser assets (service worker) outside the TS project.
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'src/lib/database.types.ts',
      'public/**',
    ],
  },
]
