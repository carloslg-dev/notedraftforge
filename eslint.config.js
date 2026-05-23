import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore output dirs and wireframes prototype (separate package)
  { ignores: ['dist', 'node_modules', 'wireframes/'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Domain layer: must not import any framework or adapter package
  {
    files: ['src/core/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react-router-dom'],
              message: '[domain] Must not import React or router.',
            },
            {
              group: ['@tiptap/*'],
              message: '[domain] Must not import Tiptap.',
            },
            {
              group: ['dexie', 'dexie-*'],
              message: '[domain] Must not import Dexie.',
            },
            {
              group: ['zod'],
              message: '[domain] Must not import Zod.',
            },
            {
              group: ['@/core/infrastructure/*'],
              message: '[domain] Must not import from infrastructure layer.',
            },
            {
              group: ['@/ui/*'],
              message: '[domain] Must not import from ui layer.',
            },
          ],
        },
      ],
    },
  },

  // Application layer: must not import infrastructure or ui
  {
    files: ['src/core/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom'],
              message: '[application] Must not import React.',
            },
            {
              group: ['@tiptap/*'],
              message: '[application] Must not import Tiptap.',
            },
            {
              group: ['dexie', 'dexie-*'],
              message: '[application] Must not import Dexie.',
            },
            {
              group: ['zod'],
              message: '[application] Must not import Zod.',
            },
            {
              group: ['@/core/infrastructure/*'],
              message: '[application] Must not import from infrastructure directly. Use ports.',
            },
            {
              group: ['@/ui/*'],
              message: '[application] Must not import from ui.',
            },
          ],
        },
      ],
    },
  },
);