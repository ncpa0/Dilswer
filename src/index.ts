import { Type } from "@DataTypes/Type";
import { And, Exclude, Omit, Partial, Pick, Required } from "@Intrinsic/index";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import { toTsType } from "@TsTypeGenerator/to-ts-type";
import { parseWith } from "@UniversalParser/universal-parser";
import { compile } from "@Validation/compile-fast-validator";
import { validateWith, validator } from "@Validation/create-validator";
import { assertType } from "@Validation/ensure-data-type";
import { ValidationError } from "@Validation/validation-error/validation-error";

export type {
  AnyType,
  BasicType,
  BasicTypeNames,
  ComplexType,
  FieldDescriptor,
  Metadata as TypeMetadata,
  RecordTypeSchema,
  TypeVisitor,
} from "@DataTypes/type-types";
export type { Infer } from "@DataTypes/type-utils";
export type { ArrayType } from "@DataTypes/types/array";
export type { BooleanType } from "@DataTypes/types/boolean";
export type { CustomType } from "@DataTypes/types/custom";
export type { DictType } from "@DataTypes/types/dict";
export type { EnumType } from "@DataTypes/types/enum";
export type { EnumMemberType } from "@DataTypes/types/enum-member";
export type { FunctionType } from "@DataTypes/types/function";
export type { InstanceOfType } from "@DataTypes/types/instance";
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
export type { StringFloatType as StringNumeralType } from "@DataTypes/types/string-float";
export type { StringIntegerType } from "@DataTypes/types/string-integer";
export type { StringMatchingType } from "@DataTypes/types/string-matching";
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
export type { FastValidator } from "@Validation/compile-fast-validator";

export {
  And,
  assertType,
  compile,
  /** alias for `compile()` */
  compile as compileFastValidator,
  Exclude,
  Omit,
  parseWith,
  Partial,
  Pick,
  Required,
  toJsonSchema,
  toTsType,
  Type,
  validateWith,
  ValidationError,
  validator,
};

export default {
  And,
  assertType,
  compile,
  /** alias for `compile()` */
  compileFastValidator: compile,
  Exclude,
  Omit,
  parseWith,
  Partial,
  Pick,
  Required,
  toJsonSchema,
  toTsType,
  Type,
  validateWith,
  ValidationError,
  validator,
};
