module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:svelte/recommended',
    'prettier'
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte']
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser'
    }
  ],
  rules: {
    // General rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // Code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    
    // Svelte specific
    'svelte/no-at-html-tags': 'error',
    'svelte/no-dupe-else-if-blocks': 'error',
    'svelte/no-dupe-style-properties': 'error',
    'svelte/no-dynamic-slot-name': 'error',
    'svelte/no-inner-declarations': 'error',
    'svelte/no-not-function-handler': 'error',
    'svelte/no-object-in-text-mustaches': 'error',
    'svelte/no-reactive-functions': 'error',
    'svelte/no-reactive-literals': 'error',
    'svelte/no-shorthand-style-property-overrides': 'error',
    'svelte/no-unknown-style-directive-property': 'error',
    'svelte/no-unused-svelte-ignore': 'error',
    'svelte/no-useless-mustaches': 'error',
    'svelte/prefer-class-directive': 'error',
    'svelte/prefer-style-directive': 'error',
    'svelte/valid-compile': 'error',
    
    // Style preferences
    'svelte/first-attribute-linebreak': ['error', {
      multiline: 'below',
      singleline: 'beside'
    }],
    'svelte/html-closing-bracket-spacing': 'error',
    'svelte/html-quotes': ['error', { prefer: 'double' }],
    'svelte/html-self-closing': 'error',
    'svelte/indent': ['error', { indent: 2 }],
    'svelte/max-attributes-per-line': ['error', {
      multiline: 1,
      singleline: 8
    }],
    'svelte/mustache-spacing': 'error',
    'svelte/no-spaces-around-equal-signs-in-attribute': 'error',
    'svelte/shorthand-attribute': 'error',
    'svelte/shorthand-directive': 'error',
    'svelte/spaced-html-comment': 'error'
  }
}; 