import type { BasicDataTypes, dataTypeSymbol } from "./type-def-helpers";
import type { ValueOf } from "./type-utils";

export type ArrayOf<DT extends AllDataTypes[] = any[]> = {
  readonly [dataTypeSymbol]: true;
  readonly arrayOf: DT;
};

export type RecordOf<TS extends RecordTypeSchema = RecordTypeSchema> = {
  readonly [dataTypeSymbol]: true;
  readonly recordOf: TS;
};

export type SetOf<DT extends AllDataTypes[] = any[]> = {
  readonly [dataTypeSymbol]: true;
  readonly setOf: DT;
};

export type OneOf<DT extends AllDataTypes[] = any[]> = {
  readonly [dataTypeSymbol]: true;
  readonly oneOf: DT;
};

export type Literal<
  V extends string | number | boolean = string | number | boolean
> = {
  readonly [dataTypeSymbol]: true;
  readonly literal: V;
};

export type Enum<E = any> = {
  readonly [dataTypeSymbol]: true;
  readonly enumInstance: E;
};

export type EnumMember<M = any> = {
  readonly [dataTypeSymbol]: true;
  readonly enumMember: M;
};

export type BasicDataType = ValueOf<typeof BasicDataTypes>;

export type ComplexDataType =
  | ArrayOf
  | RecordOf
  | SetOf
  | OneOf
  | Literal
  | Enum
  | EnumMember;

export type AllDataTypes = BasicDataType | ComplexDataType;

export type FieldDescriptor = {
  readonly required?: boolean;
  readonly type: AllDataTypes;
};

export interface RecordTypeSchema {
  readonly [key: string]: FieldDescriptor | AllDataTypes;
}
