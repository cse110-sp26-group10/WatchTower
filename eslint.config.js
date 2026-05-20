import js from '@eslint/js';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  js.configs.recommended,
  // All source JS
  {
    files: ['src/**/*.js'],
    plugins: { jsdoc },
    rules: {
      'no-var': 'error',
      semi: ['error', 'always'],
      'no-console': 'off',
      'jsdoc/require-jsdoc': ['warn', {
        publicOnly: true,
        require: { FunctionDeclaration: true },
      }],
    },
  },
  // Browser globals — dashboard, tracker, shared JS utilities, and test-app
  {
    files: [
      'src/prototype/dashboard/**/*.js',
      'src/prototype/tracker/**/*.js',
      'src/js/**/*.js',
      'src/test-app/**/*.js',
    ],
    languageOptions: { globals: globals.browser },
  },
  // Test-app scripts share globals across multiple script tags — relax
  // no-unused-vars for functions that are called from HTML onclick handlers
  // or from sibling scripts loaded in the same page.
  {
    files: ['src/test-app/**/*.js'],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^(escapeHtml|addToCart|removeFromCart|clearCart|getCartCount|getCart|getProducts|getProductById|getProductsByCategory|getCategories|submitSurvey|triggerTestError|handleRemove|selectSize|handleAddToCart|setCategory)$' }],
    },
  },
  // Node globals — server
  {
    files: ['src/prototype/server/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  // Unit test files — Vitest globals
  {
    files: ['tests/unit/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: { 'jsdoc/require-jsdoc': 'off' },
  },
  // E2E test files
  {
    files: ['tests/e2e/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'jsdoc/require-jsdoc': 'off' },
  },
];
