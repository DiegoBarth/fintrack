module.exports = {
   env: {
      browser: true,
      es2020: true,
      node: true,
   },
   extends: [
      'eslint:recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
   ],
   ignorePatterns: ['dist'],
   parser: '@typescript-eslint/parser',
   parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
         jsx: true,
      },
   },
   plugins: ['import', '@typescript-eslint'],
   rules: {
      'import/order': [
         'error',
         {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            pathGroups: [
               {
                  pattern: '@/**',
                  group: 'internal',
               },
            ],
            pathGroupsExcludedImportTypes: ['builtin'],
            alphabetize: {
               order: 'asc',
               caseInsensitive: true,
            },
         },
      ],
   },
   settings: {
      'import/resolver': {
         typescript: {},
      },
   },
}