import { DataType } from "@DataTypes/data-types";
import { And, Exclude, Omit, Partial, Pick, Required } from "@Intrinsic";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import {
  createTypeGuardedFunction,
  createValidatedFunction,
} from "@Validation/create-validated-function";
import { createChecker, createValidator } from "@Validation/create-validator";
import { ensureDataType } from "@Validation/ensure-data-type";

export const assertDataType = ensureDataType;

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
  Omit,
  Partial,
  Pick,
  Required,
  toJsonSchema,
};

export { DataType } from "@DataTypes/data-types";
export type { GetDataType } from "@DataTypes/type-utils";
export type {
  AllDataTypes,
  AnyDataType,
  ArrayOf,
  BasicDataType,
  ComplexDataType,
  Enum,
  EnumMember,
  FieldDescriptor,
  Literal,
  OneOf,
  RecordOf,
  RecordTypeSchema as TypeSchema,
  SetOf,
} from "@DataTypes/types";
export * from "@Intrinsic";
export { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
export type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
export {
  createTypeGuardedFunction,
  createValidatedFunction,
} from "@Validation/create-validated-function";
export { createChecker, createValidator } from "@Validation/create-validator";
export { ensureDataType } from "@Validation/ensure-data-type";
