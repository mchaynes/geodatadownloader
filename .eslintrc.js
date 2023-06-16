module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  extends: ["eslint:recommended"],
  plugins: ["@typescript-eslint", "react-hooks"],
  root: true,
};
