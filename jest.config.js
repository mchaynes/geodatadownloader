// Most of this was taken from: https://github.com/defiantgoat/esri-react-typescript
module.exports = {
  setupFiles: [
    "jest-canvas-mock",
    "<rootDir>/src/setupTests.js"
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)?$": "ts-jest",
    "^.+\\.(png)": "<rootDir>/src/__mocks__/fileTransformer.js"
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js|jsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    ".+\\.(css|scss)$": "identity-obj-proxy"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@arcgis|@esri|@stencil)/)"
  ],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupJest.js"],

  collectCoverage: true,
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
    "src/**/*.(ts|tsx|js)",
    "!src/keys.ts",
    "!src/index.tsx",
    "!src/tests/*"
  ],
  // "coverageThreshold": {
  //   "global": {
  //     "branches": 90,
  //     "functions": 90,
  //     "lines": 90
  //   }
  // },
  globals: {
    "ts-jest": {
      "diagnostics": {
        "warnOnly": true
      }
    }
  }
}