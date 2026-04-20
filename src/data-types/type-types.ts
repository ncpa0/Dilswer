import type { ArrayType } from "@DataTypes/types/array";
import type { BooleanType } from "@DataTypes/types/boolean";
import type { CustomType } from "@DataTypes/types/custom";
import type { DictType } from "@DataTypes/types/dict";
import type { EnumType } from "@DataTypes/types/enum";
import type { EnumMemberType } from "@DataTypes/types/enum-member";
import type { FunctionType } from "@DataTypes/types/function";
import type { InstanceOfType } from "@DataTypes/types/instance";
import type { IntegerType } from "@DataTypes/types/integer";
import type { IntersectionType } from "@DataTypes/types/intersection";
import type { LiteralType } from "@DataTypes/types/literal";
import type { NullType } from "@DataTypes/types/null";
import type { NumberType } from "@DataTypes/types/number";
import type { RecordType } from "@DataTypes/types/record";
import type {
  RecursiveType,
  RecursiveTypeReference,
} from "@DataTypes/types/recursive";
import type { SetType } from "@DataTypes/types/set";
import type { StringType } from "@DataTypes/types/string";
import type { StringFloatType } from "@DataTypes/types/string-float";
import type { StringIntegerType } from "@DataTypes/types/string-integer";
import type { StringMatchingType } from "@DataTypes/types/string-matching";
import type { SymbolType } from "@DataTypes/types/symbol";
import type { TupleType } from "@DataTypes/types/tuple";
import type { UndefinedType } from "@DataTypes/types/undefined";
import type { UnionType } from "@DataTypes/types/union";
import type { UnknownType } from "@DataTypes/types/unknown";

export interface RecordVisitChild<R> {
  _isRecordOfVisitChild: true;
  propertyName: string;
  required: boolean;
  child: R;
}

export interface TypeVisitor<R = any> {
  visit(
    dataType: Exclude<AnyType, RecordType>,
    children: undefined | R[],
    depth: number,
  ): R;
  visit(
    dataType: RecordType,
    children: undefined | RecordVisitChild<R>[],
    depth: number,
  ): R;
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
  | StringFloatType
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

export type Metadata<T extends Record<any, any> = Record<any, any>> = {
  description?: string;
  title?: string;
  format?: string;
  extra?: T;
};
