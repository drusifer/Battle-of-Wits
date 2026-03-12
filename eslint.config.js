import js from '@eslint/js';
import security from 'eslint-plugin-security';
import globals from 'globals';

export default [
  // ── Base: recommended rules ─────────────────────────────────────────────
  {
    ...js.configs.recommended,
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // ── src/ — full rule set ────────────────────────────────────────────────
  {
    files: ['src/**/*.js'],
    plugins: { security },
    rules: {
      // ── Dead code ──────────────────────────────────────────────────────
      'no-unused-vars':    ['error', { argsIgnorePattern: '^_', caughtErrors: 'all' }],
      'no-unreachable':    'error',
      'no-unused-expressions': 'error',

      // ── Complexity ─────────────────────────────────────────────────────
      'complexity':               ['warn', { max: 10 }],
      'max-depth':                ['warn', { max: 4 }],
      'max-lines-per-function':   ['warn', { max: 40, skipBlankLines: true, skipComments: true }],
      'max-params':               ['warn', { max: 4 }],
      'max-nested-callbacks':     ['warn', { max: 3 }],

      // ── Structure / code smells ────────────────────────────────────────
      'no-var':              'error',
      'prefer-const':        'error',
      'eqeqeq':              ['error', 'always'],
      'no-magic-numbers':    ['warn', { ignore: [0, 1, 2, -1, 100], ignoreArrayIndexes: true, ignoreDefaultValues: true }],
      'no-nested-ternary':   'error',
      'no-lonely-if':        'error',
      'no-else-return':      'warn',
      'no-param-reassign':   'warn',
      'consistent-return':   'warn',
      'no-console':          'warn',
      'no-shadow':           'warn',
      'prefer-arrow-callback': 'warn',

      // ── Security ───────────────────────────────────────────────────────
      'security/detect-eval-with-expression':      'error',
      'security/detect-non-literal-regexp':        'error',
      'security/detect-non-literal-fs-filename':   'warn',
      'security/detect-object-injection':          'warn',
      'security/detect-possible-timing-attacks':   'warn',
      'security/detect-unsafe-regex':              'error',
    },
  },

  // ── tests/ — relaxed rules (magic numbers, console OK in tests) ─────────
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-magic-numbers': 'off',
      'no-console':       'off',
      'max-lines-per-function': 'off',
      'no-unused-vars':   ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // ── agents/tools — node scripts, relax most rules ──────────────────────
  {
    files: ['agents/tools/**/*.mjs', 'agents/tools/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-console':       'off',
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
    },
  },
];
