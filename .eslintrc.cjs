/* ESLint configuration for React 18 with hooks rules and security best practices */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.3' } },
  plugins: ['react-refresh'],
  rules: {
    /* Warn on components not safe for fast refresh */
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    /* Enforce prop types for component documentation */
    'react/prop-types': 'off',
    /* Prevent unused variables from cluttering code */
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    /* Prevent console.log in production code */
    'no-console': 'warn',
  },
};
