// @ts-check

import eslint from '@eslint/js';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(

  {
    files: ['**/src/**/*.ts', '**/eslint.config.mjs'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
    ],
    plugins: {
      '@stylistic/ts': stylisticTs,
      'unused-imports': unusedImports,
    },
    rules: {
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false,
        },
      ],
      '@stylistic/ts/comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      }],
      '@stylistic/ts/object-curly-spacing': ['error', 'always'],
      '@stylistic/ts/indent': ['error', 2],
      '@stylistic/ts/semi': ['error', 'always'],
      "no-multi-spaces": ["error"],
      // '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      // '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-': 'off',
      'no-unused-private-class-members': ['warn'],
      // '@typescript-eslint/no-unsafe-function-types': 'off',
      // 'no-prototype-builtins': 'off',
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          "fixStyle": "separate-type-imports",
          "prefer": "type-imports",
        },
      ],
      'unused-imports/no-unused-imports': 'error', // Auto-removes unused imports
    },
  },
  {
    ignores: ['**/src/types/*.d.ts'],
  },
);
