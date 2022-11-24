/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
  testRegex: ".*__tests__/.+(\\.test\\.(ts|js|tsx|jsx))$",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  moduleNameMapper: {
    "^@DataTypes/(.*)": "<rootDir>/src/data-types/$1",
    "^@Utilities/(.*)": "<rootDir>/src/utilities/$1",
    "^@Validation/(.*)": "<rootDir>/src/validation-algorithms/$1",
    "^@JSONSchemaParser/(.*)": "<rootDir>/src/json-schema-parser/$1",
    "^@Intrinsic/(.*)": "<rootDir>/src/intrinsic-type-utils/$1",
    "^@Intrinsic": "<rootDir>/src/intrinsic-type-utils/index",
    "^@TsTypeGenerator/(.*)": "<rootDir>/src/ts-type-generator/$1",
    "^@TsTypeGenerator": "<rootDir>/src/ts-type-generator/index",
  },
  testEnvironment: "jsdom",
  roots: ["<rootDir>"],
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["html", "text"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage/",
    "/__mocks__/",
    "/__tests__/",
    "/dist/",
    "/scripts/",
    "/.husky/",
    "/.vscode/",
  ],
};
