import type { BasicDataTypes } from "./schame-construction-helpers";
import type { ValueOf } from "./type-utils";

export type ArrayOf<DT extends AllDataTypes[] = any[]> = {
  arrayOf: DT;
};

export type RecordOf<TS extends RecordTypeSchema = RecordTypeSchema> = {
  recordOf: TS;
};

export type SetOf<DT extends AllDataTypes[] = any[]> = {
  setOf: DT;
};

export type OneOf<DT extends AllDataTypes[] = any[]> = {
  oneOf: DT;
};

export type Literal<
  V extends string | number | boolean = string | number | boolean
> = {
  literal: V;
};

export type Enum<E = any> = {
  enumInstance: E;
};

export type EnumMember<M = any> = {
  enumMember: M;
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
  required?: boolean;
  type: AllDataTypes;
};

export type RecordTypeSchema = Record<string, FieldDescriptor>;
