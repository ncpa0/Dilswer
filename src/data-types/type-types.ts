import { ArrayType } from "@DataTypes/types/array";
import { BooleanType } from "@DataTypes/types/boolean";
import { CustomType } from "@DataTypes/types/custom";
import { DictType } from "@DataTypes/types/dict";
import { EnumType } from "@DataTypes/types/enum";
import { EnumMemberType } from "@DataTypes/types/enum-member";
import { FunctionType } from "@DataTypes/types/function";
import { InstanceOfType } from "@DataTypes/types/instance";
import { IntegerType } from "@DataTypes/types/integer";
import { IntersectionType } from "@DataTypes/types/intersection";
import { LiteralType } from "@DataTypes/types/literal";
import { NullType } from "@DataTypes/types/null";
import { NumberType } from "@DataTypes/types/number";
import { RecordType } from "@DataTypes/types/record";
import {
  RecursiveType,
  RecursiveTypeReference,
} from "@DataTypes/types/recursive";
import { SetType } from "@DataTypes/types/set";
import { StringType } from "@DataTypes/types/string";
import { StringFloatType } from "@DataTypes/types/string-float";
import { StringIntegerType } from "@DataTypes/types/string-integer";
import { StringMatchingType } from "@DataTypes/types/string-matching";
import { SymbolType } from "@DataTypes/types/symbol";
import { TupleType } from "@DataTypes/types/tuple";
import { UndefinedType } from "@DataTypes/types/undefined";
import { UnionType } from "@DataTypes/types/union";
import { UnknownType } from "@DataTypes/types/unknown";

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
