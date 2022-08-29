/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testRegex: ".*__tests__/.+(\\.test\\.(ts|js|tsx|jsx))$",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^@DataTypes/(.*)": "<rootDir>/src/data-types/$1",
    "^@Utilities/(.*)": "<rootDir>/src/utilities/$1",
    "^@Validation/(.*)": "<rootDir>/src/validation-algorithms/$1",
    "^@Intrinsic/(.*)": "<rootDir>/src/intrinsic-type-utils/$1",
    "^@Intrinsic": "<rootDir>/src/intrinsic-type-utils/index",
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
