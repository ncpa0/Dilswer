import type { ArrayType } from "./types/array";
import type { BooleanType } from "./types/boolean";
import type { CustomType } from "./types/custom";
import type { DictType } from "./types/dict";
import type { EnumType } from "./types/enum";
import type { EnumMemberType } from "./types/enum-member";
import type { FunctionType } from "./types/function";
import type { InstanceOfType } from "./types/instance";
import type { IntegerType } from "./types/integer";
import type { IntersectionType } from "./types/intersection";
import type { LiteralType } from "./types/literal";
import type { NullType } from "./types/null";
import type { NumberType } from "./types/number";
import type { RecordType } from "./types/record";
import type { RecursiveType, RecursiveTypeReference } from "./types/recursive";
import type { SetType } from "./types/set";
import type { StringType } from "./types/string";
import type { StringIntegerType } from "./types/string-integer";
import type { StringMatchingType } from "./types/string-matching";
import type { StringNumeralType } from "./types/string-numberal";
import type { SymbolType } from "./types/symbol";
import type { TupleType } from "./types/tuple";
import type { UndefinedType } from "./types/undefined";
import type { UnionType } from "./types/union";
import type { UnknownType } from "./types/unknown";

export interface RecordVisitChild<R> {
  _isRecordOfVisitChild: true;
  propertyName: string;
  required: boolean;
  child: R;
}

export interface TypeVisitor<R = any> {
  visit(dataType: Exclude<AnyType, RecordType>, children?: R[]): R;
  visit(dataType: RecordType, children?: RecordVisitChild<R>[]): R;
}

export type BasicTypeNames =
  | "string"
  | "number"
  | "boolean"
  | "unknown"
  | "integer"
  | "symbol"
  | "function"
  | "null"
  | "undefined"
  | "stringnumeral"
  | "stringinteger";

export type BasicType =
  | BooleanType
  | FunctionType
  | IntegerType
  | NullType
  | NumberType
  | StringType
  | StringIntegerType
  | StringNumeralType
  | SymbolType
  | UndefinedType
  | UnknownType;

export type ComplexType =
  | ArrayType
  | CustomType
  | DictType
  | EnumType
  | EnumMemberType
  | InstanceOfType
  | IntersectionType
  | LiteralType
  | RecordType
  | RecursiveType
  | RecursiveTypeReference
  | SetType
  | StringMatchingType
  | TupleType
  | UnionType;

export type DataTypeKind =
  | "simple"
  | "array"
  | "tuple"
  | "record"
  | "dictionary"
  | "set"
  | "union"
  | "intersection"
  | "literal"
  | "enumUnion"
  | "enumMember"
  | "instanceOf"
  | "custom"
  | "stringMatching"
  | "circular"
  | "circularRef";

export type AnyType = BasicType | ComplexType;

export type FieldDescriptor = {
  readonly required?: boolean;
  readonly type: AnyType;
};

export type OptionalField<DT extends AnyType> = {
  readonly required: false;
  readonly type: DT;
};

export interface RecordTypeSchema {
  readonly [key: string]: FieldDescriptor | AnyType;
}

export type TypeMetadata<T extends Record<any, any> = Record<any, any>> = {
  description?: string;
  title?: string;
  format?: string;
  extra?: T;
};
