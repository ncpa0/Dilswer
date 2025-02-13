import { BaseType } from "@DataTypes/data-types";
import { Type } from "@DataTypes/Type";
import { AnyDataType } from "@DataTypes/types";
import {
  And,
  Exclude,
  Omit,
  OptionalField,
  Partial,
  Pick,
  Required,
} from "@Intrinsic/index";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import { toTsType } from "@TsTypeGenerator/to-ts-type";
import { parseWith } from "@UniversalParser/universal-parser";
import { compileFastValidator } from "@Validation/compile-fast-validator";
import { validator } from "@Validation/create-validator";
import { ensureValid } from "@Validation/ensure-data-type";
import { ValidationError } from "@Validation/validation-error/validation-error";

const assertValid = ensureValid;

export type { GetDataType } from "@DataTypes/type-utils";
export type {
  AllDataTypes,
  AnyDataType,
  BasicDataType,
  BasicTypeNames,
  ComplexDataType,
  FieldDescriptor,
  RecordTypeSchema,
  TypeMetadata,
  TypeVisitor as DataTypeVisitor,
} from "@DataTypes/types";
export type { ArrayType } from "@DataTypes/types/array";
export type { BooleanType } from "@DataTypes/types/boolean";
export type { CustomType } from "@DataTypes/types/custom";
export type { DictType } from "@DataTypes/types/dict";
export type { EnumType } from "@DataTypes/types/enum";
export type { EnumMemberType } from "@DataTypes/types/enum-member";
export type { FunctionType } from "@DataTypes/types/function";
export type { InstanceOfType as InstanceType } from "@DataTypes/types/instance";
export type { IntegerType } from "@DataTypes/types/integer";
export type { IntersectionType } from "@DataTypes/types/intersection";
export type { LiteralType } from "@DataTypes/types/literal";
export type { NullType } from "@DataTypes/types/null";
export type { NumberType } from "@DataTypes/types/number";
export type { RecordType } from "@DataTypes/types/record";
export type {
  RecursiveType,
  RecursiveTypeReference,
} from "@DataTypes/types/recursive";
export type { SetType } from "@DataTypes/types/set";
export type { StringType } from "@DataTypes/types/string";
export type { StringIntegerType } from "@DataTypes/types/string-integer";
export type { StringMatchingType } from "@DataTypes/types/string-matching";
export type { StringNumeralType } from "@DataTypes/types/string-numberal";
export type { SymbolType } from "@DataTypes/types/symbol";
export type { TupleType } from "@DataTypes/types/tuple";
export type { UndefinedType } from "@DataTypes/types/undefined";
export type { UnionType } from "@DataTypes/types/union";
export type { UnknownType } from "@DataTypes/types/unknown";
export * from "@Intrinsic/index";
export type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
export type {
  TsParsingMode,
  TsParsingOptions,
} from "@TsTypeGenerator/parser-options";

/**
 * Retrieves the metadata of a DataType, like title, description
 * or examples.
 *
 * Metadata must be explicitly set on the DataType, otherwise it
 * will be an empty object.
 */
const getMetadata = <T extends Record<any, any>>(dt: AnyDataType) =>
  BaseType.getMetadata<T>(dt);

export {
  And,
  assertValid,
  compileFastValidator,
  ensureValid,
  Exclude,
  getMetadata,
  Omit,
  OptionalField,
  parseWith,
  Partial,
  Pick,
  Required,
  toJsonSchema,
  toTsType,
  Type,
  ValidationError,
  validator,
};

export default {
  And,
  assertValid,
  validator,
  compileFastValidator,
  ValidationError,
  Type,
  ensureValid,
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
