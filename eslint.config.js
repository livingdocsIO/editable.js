const react = require('eslint-plugin-react')

const {
  fixupPluginRules
} = require('@eslint/compat')

const globals = require('globals')

module.exports = [
  {
    ignores: [
      'coverage/',
      'dist/',
      'examples/dist/',
      'lib/',
      'hmr.js'
    ]
  },
  {
    plugins: {
      react: fixupPluginRules(react)
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jasmine,
        document: false,
        navigator: false,
        window: false,
        expect: true,
        test: true,
        sinon: true,
        angular: true
      },

      ecmaVersion: 2021,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },

    rules: {
      'react/jsx-uses-vars': 'warn',
      'react/jsx-uses-react': 'warn',
      'accessor-pairs': 2,

      'arrow-spacing': [
        2,
        {
          before: true,
          after: true
        }
      ],

      'block-spacing': [2, 'always'],

      'brace-style': [
        2,
        '1tbs',
        {
          allowSingleLine: true
        }
      ],

      camelcase: [
        2,
        {
          properties: 'never'
        }
      ],

      'comma-dangle': [2, 'never'],

      'comma-spacing': [
        2,
        {
          before: false,
          after: true
        }
      ],

      'comma-style': [2, 'last'],
      'computed-property-spacing': [2, 'never'],
      'constructor-super': 2,
      curly: [2, 'multi-line'],
      'dot-location': [2, 'property'],
      'eol-last': [2, 'always'],
      eqeqeq: [2, 'allow-null'],
      'func-call-spacing': [2, 'never'],
      'callback-return': 0,
      'handle-callback-err': [2, '^(err|error)$'],

      indent: [
        2,
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,

          FunctionDeclaration: {
            parameters: 1,
            body: 1
          },

          FunctionExpression: {
            parameters: 1,
            body: 1
          }
        }
      ],

      'key-spacing': [
        2,
        {
          beforeColon: false,
          afterColon: true
        }
      ],

      'keyword-spacing': [
        2,
        {
          before: true,
          after: true
        }
      ],

      'linebreak-style': [2, 'unix'],
      'max-len': 0,

      'new-cap': [
        2,
        {
          newIsCap: true,
          capIsNew: false
        }
      ],

      'new-parens': 2,

      'newline-per-chained-call': [
        2,
        {
          ignoreChainWithDepth: 4
        }
      ],

      'no-array-constructor': 2,
      'no-caller': 2,
      'no-class-assign': 2,
      'no-cond-assign': 2,
      'no-console': 0,
      'no-const-assign': 2,

      'no-constant-condition': [
        2,
        {
          checkLoops: false
        }
      ],

      'no-control-regex': 2,
      'no-debugger': 2,
      'no-delete-var': 2,
      'no-dupe-args': 2,
      'no-dupe-class-members': 2,
      'no-dupe-keys': 2,
      'no-duplicate-case': 2,
      'no-duplicate-imports': 2,
      'no-empty-character-class': 2,
      'no-empty-pattern': 2,
      'no-eval': 2,
      'no-ex-assign': 2,
      'no-extend-native': 2,
      'no-extra-bind': 2,
      'no-extra-boolean-cast': 2,
      'no-extra-parens': [2, 'functions'],
      'no-fallthrough': 2,
      'no-floating-decimal': 2,
      'no-func-assign': 2,
      'no-global-assign': 2,
      'no-implied-eval': 2,
      'no-inner-declarations': [2, 'functions'],
      'no-invalid-regexp': 2,
      'no-irregular-whitespace': 2,
      'no-iterator': 2,
      'no-label-var': 2,

      'no-labels': [
        2,
        {
          allowLoop: false,
          allowSwitch: false
        }
      ],

      'no-lone-blocks': 2,
      'no-lonely-if': 2,

      'no-mixed-operators': [
        1,
        {
          groups: [
            ['+', '-', '*', '/', '%', '**'],
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof']
          ],

          allowSamePrecedence: false
        }
      ],

      'no-mixed-spaces-and-tabs': 2,
      'no-multi-spaces': 2,
      'no-multi-str': 2,

      'no-multiple-empty-lines': [
        2,
        {
          max: 2
        }
      ],

      'no-native-reassign': 2,
      'no-negated-in-lhs': 2,
      'no-nested-ternary': 2,
      'no-new': 2,
      'no-new-func': 2,
      'no-new-object': 2,
      'no-new-require': 2,
      'no-new-symbol': 2,
      'no-new-wrappers': 2,
      'no-obj-calls': 2,
      'no-octal': 2,
      'no-octal-escape': 2,
      'no-path-concat': 2,
      'no-proto': 2,
      'no-redeclare': 2,
      'no-regex-spaces': 2,
      'no-return-assign': [2, 'except-parens'],
      'no-self-assign': 2,
      'no-self-compare': 2,
      'no-sequences': 2,
      'no-shadow-restricted-names': 2,

      'no-shadow': [
        1,
        {
          allow: ['argv', 'callback', 'cb', 'done', 'err', 'params']
        }
      ],

      'no-sparse-arrays': 2,
      'no-tabs': 2,
      'no-template-curly-in-string': 2,
      'no-this-before-super': 2,
      'no-throw-literal': 2,
      'no-trailing-spaces': 2,
      'no-undef': 2,
      'no-undef-init': 2,
      'no-unexpected-multiline': 2,
      'no-unmodified-loop-condition': 2,

      'no-unneeded-ternary': [
        2,
        {
          defaultAssignment: false
        }
      ],

      'no-unreachable': 2,
      'no-unsafe-finally': 2,
      'no-unsafe-negation': 2,

      'no-unused-vars': [
        2,
        {
          vars: 'all',
          args: 'none',
          caughtErrors: 'none'
        }
      ],

      'no-useless-call': 2,
      'no-useless-computed-key': 2,
      'no-useless-constructor': 2,
      'no-useless-escape': 2,
      'no-useless-rename': 2,
      'no-var': 2,
      'no-whitespace-before-property': 2,
      'no-with': 2,
      'object-curly-spacing': [1, 'never'],

      'object-property-newline': [
        2,
        {
          allowMultiplePropertiesPerLine: true
        }
      ],

      'one-var': [
        2,
        {
          initialized: 'never'
        }
      ],

      'operator-linebreak': [
        2,
        'after',
        {
          overrides: {
            '?': 'before',
            ':': 'before'
          }
        }
      ],

      'padded-blocks': [0, 'never'],

      'prefer-const': [
        1,
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: true
        }
      ],

      'rest-spread-spacing': [2, 'never'],
      semi: [2, 'never'],

      'semi-spacing': [
        2,
        {
          before: false,
          after: true
        }
      ],

      'space-before-blocks': [2, 'always'],
      'space-before-function-paren': [2, 'always'],
      'space-in-parens': [2, 'never'],
      'space-infix-ops': 2,

      'space-unary-ops': [
        2,
        {
          words: true,
          nonwords: false
        }
      ],

      'spaced-comment': [
        2,
        'always',
        {
          line: {
            markers: ['*package', '!', ',']
          },

          block: {
            balanced: true,
            markers: ['*package', '!', ','],
            exceptions: ['*']
          }
        }
      ],

      'template-curly-spacing': [2, 'never'],
      'unicode-bom': [2, 'never'],
      'use-isnan': 2,
      'valid-typeof': 2,

      'wrap-iife': [
        2,
        'any',
        {
          functionPrototypeMethods: true
        }
      ],

      'yield-star-spacing': [2, 'both'],
      yoda: [2, 'never']
    }
  }
]
