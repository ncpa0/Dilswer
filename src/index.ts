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
import { parseWith } from "@UniversalParser/universal-parser";
import { compileFastValidator } from "@Validation/compile-fast-validator";
import {
  createTypeGuardedFunction,
  createValidatedFunction,
} from "@Validation/create-validated-function";
import { createChecker, createValidator } from "@Validation/create-validator";
import { ensureDataType } from "@Validation/ensure-data-type";
import { ValidationError } from "@Validation/validation-error/validation-error";

const assertDataType = ensureDataType;
const Type = DataType;

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
  DataTypeVisitor,
  Dict,
  Enum,
  EnumMember,
  FieldDescriptor,
  Literal,
  OneOf,
  RecordOf,
  RecordOfVisitChild,
  RecordTypeSchema,
  SetOf,
  TypeMetadata,
} from "@DataTypes/types";
export * from "@Intrinsic";
export type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
export type {
  TsParsingMode,
  TsParsingOptions,
} from "@TsTypeGenerator/parser-options";
export {
  And,
  assertDataType,
  createChecker,
  createTypeGuardedFunction,
  createValidatedFunction,
  createValidator,
  compileFastValidator,
  ValidationError,
  DataType,
  Type,
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
  parseWith,
};

export default {
  And,
  assertDataType,
  createChecker,
  createTypeGuardedFunction,
  createValidatedFunction,
  createValidator,
  compileFastValidator,
  ValidationError,
  DataType,
  Type,
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
  parseWith,
};
