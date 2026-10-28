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
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
<<<<<<< HEAD
=======
    'react/prop-types': 'off',
>>>>>>> 756de1679ca0efb7ccbb987f619ca511799d9d5a
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
<<<<<<< HEAD
=======
  overrides: [
    {
      files: ['socket-server/**/*.js'],
      env: { node: true },
      parserOptions: { sourceType: 'script' },
    },
  ],
>>>>>>> 756de1679ca0efb7ccbb987f619ca511799d9d5a
}
