import type { BasicDataTypes } from "./schame-construction-helpers";
import type { ValueOf } from "./type-utils";

export type ArrayOf<DT extends AllDataTypes[] = any[]> = {
  readonly arrayOf: DT;
};

export type RecordOf<TS extends RecordTypeSchema = RecordTypeSchema> = {
  readonly recordOf: TS;
};

export type SetOf<DT extends AllDataTypes[] = any[]> = {
  readonly setOf: DT;
};

export type OneOf<DT extends AllDataTypes[] = any[]> = {
  readonly oneOf: DT;
};

export type Literal<
  V extends string | number | boolean = string | number | boolean
> = {
  readonly literal: V;
};

export type Enum<E = any> = {
  readonly enumInstance: E;
};

export type EnumMember<M = any> = {
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

export type RecordTypeSchema = Readonly<Record<string, FieldDescriptor>>;
