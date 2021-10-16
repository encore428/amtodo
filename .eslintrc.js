module.exports = {
  parserOptions: {
    ecmaVersion: 2017
  },
  env: {
    es6: true
  },
  extends: ['plugin:prettier/recommended', 'plugin:jest/recommended'],
  plugins: ['filenames'],
  rules: {
    'class-methods-use-this': 'warn',
    'filenames/match-regex': [2, '^[0-9a-z-.]+$', true],
    'no-console': 'error'
  },
  env: {
    'jest/globals': true
  }
};
