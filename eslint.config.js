import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'canon-static', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      // react-hooks v7 ships both shapes: configs['recommended-latest'] is the
      // legacy eslintrc one (plugins as an array); configs.flat.* is flat config.
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    rules: {
      /* The application's only door into the canon is '@canon'. The boundary
         check enforces this too; the lint rule gives instant editor feedback. */
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@canon/*'], message: "Import from '@canon' only — deep imports break the public API." },
          { group: ['**/_incoming/*'], message: 'Components in _incoming/ are unapproved. Promote first.' },
        ],
      }],
    },
  },
  ...storybook.configs['flat/recommended'],
);
