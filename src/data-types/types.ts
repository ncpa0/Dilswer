import type {
  InstanceOf,
  SimpleDataType,
  StringMatching,
  Tuple,
} from "@DataTypes/data-types";
import {
  AllOf,
  ArrayOf,
  Custom,
  Dict,
  Enum,
  EnumMember,
  Literal,
  OneOf,
  RecordOf,
  SetOf,
} from "@DataTypes/data-types";

export {
  AllOf,
  ArrayOf,
  Custom,
  Dict,
  Enum,
  EnumMember,
  Literal,
  OneOf,
  RecordOf,
  SetOf,
};

export interface RecordOfVisitChild<R> {
  _isRecordOfVisitChild: true;
  propertyName: string;
  required: boolean;
  child: R;
}

export interface DataTypeVisitor<R = any> {
  visit(dataType: Exclude<AnyDataType, RecordOf>, children?: R[]): R;
  visit(dataType: RecordOf, children?: RecordOfVisitChild<R>[]): R;
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

export type BasicDataType = SimpleDataType<BasicTypeNames>;

export type ComplexDataType =
  | ArrayOf
  | Tuple
  | RecordOf
  | Dict
  | SetOf
  | OneOf
  | AllOf
  | Literal
  | Enum
  | EnumMember
  | InstanceOf
  | Custom
  | StringMatching;

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
  | "stringMatching";

export type AnyDataType = BasicDataType | ComplexDataType;

export type AllDataTypes = AnyDataType;

export type FieldDescriptor = {
  readonly required?: boolean;
  readonly type: AnyDataType;
};

export interface RecordTypeSchema {
  readonly [key: string]: FieldDescriptor | AnyDataType;
}

export type TypeMetadata<T extends Record<any, any> = Record<any, any>> = {
  description?: string;
  title?: string;
  format?: string;
  extra?: T;
};
