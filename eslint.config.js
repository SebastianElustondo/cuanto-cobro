// ESLint 9 (flat config). El sitio es ES5 a propósito: sin build, corre tal
// cual en cualquier navegador. Las reglas apuntan a errores reales, no a estilo.
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
      // ES5 obliga a escribir catch (e) aunque no se use
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      eqeqeq: ["error", "always"],
      "no-implicit-globals": "off"
    }
  },
  // cada módulo compartido define su propio global; en ese archivo no es una redeclaración
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
