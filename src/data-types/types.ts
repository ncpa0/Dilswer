import type { SimpleDataType } from "@DataTypes/data-types";
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
  | RecordOf
  | Dict
  | SetOf
  | OneOf
  | AllOf
  | Literal
  | Enum
  | EnumMember
  | Custom;

export type AnyDataType = BasicDataType | ComplexDataType;

export type AllDataTypes = AnyDataType;

export type FieldDescriptor = {
  readonly required?: boolean;
  readonly type: AnyDataType;
};

export interface RecordTypeSchema {
  readonly [key: string]: FieldDescriptor | AnyDataType;
}

export type TypeMetadata = {
  description?: string;
  title?: string;
  format?: string;
};
