const js = require("@eslint/js");
const globals = require("globals");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      js
    },
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node // ✅ Enable Node.js globals like process
      }
    },
    rules: {
      ...js.configs.recommended.rules
    }
  }
];
