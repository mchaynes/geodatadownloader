module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["@typescript-eslint", "react-hooks"],
  rules: {
    // Disable the base rule (it can report incorrect locations for TS code)
    "no-unused-vars": "off",
    // Warn on unused vars in TypeScript, but allow underscores for intentionally unused args
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    // Temporarily disable explicit any checks until types are improved
    "@typescript-eslint/no-explicit-any": "off",
    // Allow empty functions in test harnesses and placeholder components
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": "off",
    // Allow use of require() in some config/test files
    "@typescript-eslint/no-var-requires": "off"
  }
};
