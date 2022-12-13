import { DataType, getMetadata } from "@DataTypes/data-types";
import {
  And,
  Exclude,
  Omit,
  OptionalField,
  Partial,
  Pick,
  Required,
} from "@Intrinsic";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import { toTsType } from "@TsTypeGenerator/to-ts-type";
import {
  createTypeGuardedFunction,
  createValidatedFunction,
} from "@Validation/create-validated-function";
import { createChecker, createValidator } from "@Validation/create-validator";
import { ensureDataType } from "@Validation/ensure-data-type";
export type { GetDataType } from "@DataTypes/type-utils";
export type {
  AllDataTypes,
  AllOf,
  AnyDataType,
  ArrayOf,
  BasicDataType,
  BasicTypeNames,
  ComplexDataType,
  Custom,
  Dict,
  Enum,
  EnumMember,
  FieldDescriptor,
  Literal,
  OneOf,
  RecordOf,
  RecordTypeSchema,
  SetOf,
  TypeMetadata,
} from "@DataTypes/types";
export * from "@Intrinsic";
export type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
export type {
  TsParsingMode,
  TsParsingOptions,
} from "@TsTypeGenerator/parsers/parse";
export {
  And,
  assertDataType,
  createChecker,
  createTypeGuardedFunction,
  createValidatedFunction,
  createValidator,
  DataType,
  ensureDataType,
  Exclude,
  getMetadata,
  Omit,
  OptionalField,
  Partial,
  Pick,
  Required,
  toJsonSchema,
  toTsType,
};

const assertDataType = ensureDataType;

export default {
  And,
  assertDataType,
  createChecker,
  createTypeGuardedFunction,
  createValidatedFunction,
  createValidator,
  DataType,
  ensureDataType,
  Exclude,
  getMetadata,
  Omit,
  OptionalField,
  Partial,
  Pick,
  Required,
  toJsonSchema,
  toTsType,
};
