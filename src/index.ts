import { DataType } from "@DataTypes/data-types";
import { And, Exclude, Omit, Partial, Pick, Required } from "@Intrinsic";
import {
  createTypeGuardedFunction,
  createValidatedFunction,
} from "@Validation/create-validated-function";
import { createChecker, createValidator } from "@Validation/create-validator";
import { ensureDataType } from "@Validation/ensure-data-type";

export default {
  createChecker,
  createValidator,
  createTypeGuardedFunction,
  createValidatedFunction,
  ensureDataType,
  And,
  Exclude,
  Omit,
  Partial,
  Pick,
  Required,
  DataType,
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
export {
  createTypeGuardedFunction,
  createValidatedFunction,
} from "@Validation/create-validated-function";
export { createChecker, createValidator } from "@Validation/create-validator";
export { ensureDataType } from "@Validation/ensure-data-type";
