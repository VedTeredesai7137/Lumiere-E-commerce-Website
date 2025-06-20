module.exports = {
  env: {
    node: true,
    es2020: true, // ✅ allow optional chaining (?.)
  },
  parserOptions: {
    ecmaVersion: 2020, // ✅ explicitly set modern JS
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended"
  ],
  plugins: ["node"],
  rules: {
    "node/no-unsupported-features/es-syntax": "off", // if you're using CommonJS
    "no-unused-vars": "warn"
  }
};
