module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'prettier/@typescript-eslint',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended'
  ],

  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    }
  },
  rules: {
    '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
    '@typescript-eslint/camelcase': ['warn', { properties: 'always' }],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    'no-console': 'error',
    'no-var': 'error',
    'prettier/prettier': [
      'error',
      {
        extends: 'prettier.config.js'
      }
    ],
    'sort-imports': [
      'off',
      {
        ignoreCase: false,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
      }
    ],
    'sort-keys': 'off',
    'sort-vars': 'off'
  }
}
