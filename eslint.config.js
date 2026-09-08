const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",
      globals: {
        ...globals.browser,
        module: "readonly",
        UTIL: "readonly",
        CALC: "readonly",
        MONOTRIBUTO: "readonly"
      }
    },
    rules: {
      "no-var": "off",
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      eqeqeq: ["error", "always"],
      "no-implicit-globals": "off"
    }
  },
  { files: ["js/util.js"], languageOptions: { globals: { UTIL: "off" } } },
  { files: ["js/calc.js"], languageOptions: { globals: { CALC: "off" } } },
  { files: ["js/monotributo-data.js"], languageOptions: { globals: { MONOTRIBUTO: "off" } } },
  {
    files: ["test.js", "eslint.config.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: globals.node
    }
  },
  { ignores: ["node_modules/", ".wrangler/", "dist/"] }
];
