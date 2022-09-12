import type { BasicDataTypes, dataTypeSymbol } from "@DataTypes/data-types";
import type { ValueOf } from "@DataTypes/type-utils";

export type ArrayOf<DT extends AnyDataType[] = any[]> = {
  readonly [dataTypeSymbol]: true;
  readonly arrayOf: DT;
};

export type RecordOf<TS extends RecordTypeSchema = RecordTypeSchema> = {
  readonly [dataTypeSymbol]: true;
  readonly recordOf: TS;
};

export type Dict<DT extends AnyDataType[] = any[]> = {
  readonly [dataTypeSymbol]: true;
  readonly dict: DT;
};

export type SetOf<DT extends AnyDataType[] = any[]> = {
  readonly [dataTypeSymbol]: true;
  readonly setOf: DT;
};

export type OneOf<DT extends AnyDataType[] = any[]> = {
  readonly [dataTypeSymbol]: true;
  readonly oneOf: DT;
};

export type AllOf<DT extends AnyDataType[] = any[]> = {
  readonly [dataTypeSymbol]: true;
  readonly allOf: DT;
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

export type Custom<VF extends (v: any) => boolean = (v: any) => v is unknown> =
  {
    readonly [dataTypeSymbol]: true;
    readonly custom: VF;
  };

export type BasicDataType = ValueOf<typeof BasicDataTypes>;

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
