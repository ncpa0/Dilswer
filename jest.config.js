/** @type {import("jest").Config} */
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
    "^@UniversalParser/(.*)": "<rootDir>/src/universal-parser/$1",
    "^@UniversalParser": "<rootDir>/src/universal-parser/index",
  },
  roots: ["<rootDir>"],
  maxWorkers: 4,
};
