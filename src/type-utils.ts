import type { AllDataTypes } from ".";
import type { dataTypeSymbol } from "./type-def-helpers";
import type {
  ArrayOf,
  BasicDataType,
  ComplexDataType,
  Enum,
  EnumMember,
  FieldDescriptor,
  Literal,
  OneOf,
  RecordOf,
  RecordTypeSchema,
  SetOf,
} from "./types";

type GetDescriptorType<T extends AllDataTypes | FieldDescriptor> =
  T extends FieldDescriptor ? T["type"] : T;

type IsRequiredDescriptor<T extends AllDataTypes | FieldDescriptor> =
  T extends FieldDescriptor ? T["required"] : true;

export type ValueOf<R extends Record<any, any>> = R extends Record<any, infer T>
  ? T
  : never;

export type UnknownFunction = (...args: unknown[]) => unknown;

export type ReWrap<T> = T extends Function
  ? T
  : T extends Set<infer ST>
  ? Set<ReWrap<ST>>
  : T extends object
  ? T extends infer O
    ? { [K in keyof O]: ReWrap<O[K]> }
    : never
  : T;

export type EnsureStringType<T> = T extends string ? T : string;

export type ExcludeRequired<S extends RecordTypeSchema> = EnsureStringType<
  Exclude<
    ValueOf<{
      [K in keyof S]: IsRequiredDescriptor<S[K]> extends false ? K : undefined;
    }>,
    undefined
  >
>;

export type ExcludeOptional<S extends RecordTypeSchema> = EnsureStringType<
  Exclude<
    ValueOf<{
      [K in keyof S]: IsRequiredDescriptor<S[K]> extends false ? undefined : K;
    }>,
    undefined
  >
>;

export type EnsureIsKey<K> = K extends
  | "arrayOf"
  | "recordOf"
  | "setOf"
  | "oneOf"
  | "literal"
  | "enumInstance"
  | "enumMember"
  ? K
  : "invalid";

export type GetTypeFromArrayOf<D extends ComplexDataType> = D extends ArrayOf<
  infer T
>
  ? T[number]
  : never;

export type GetFieldDescriptorsFromSetOf<D extends ComplexDataType> =
  D extends SetOf<infer T> ? T[number] : never;

export type GetTypeFromRecordOf<D extends ComplexDataType> =
  D extends RecordOf<any> ? D : never;

export type GetTypeFromOneOf<D extends ComplexDataType> = D extends OneOf<
  infer T
>
  ? T[number]
  : never;

export type GetTypeFromLiteral<D extends ComplexDataType> = D extends Literal<
  infer T
>
  ? T
  : never;

export type GetTypeFromEnum<D extends ComplexDataType> = D extends Enum<infer T>
  ? T
  : never;

export type GetTypeFromEnumMember<D extends ComplexDataType> =
  D extends EnumMember<infer T> ? T : never;

export type ParseComplexType<D extends ComplexDataType> = {
  arrayOf: Array<ParseDataType<GetTypeFromArrayOf<D>>>;
  recordOf: ParseRecordType<GetTypeFromRecordOf<D>>;
  setOf: Set<ParseDataType<GetFieldDescriptorsFromSetOf<D>>>;
  oneOf: ParseDataType<GetTypeFromOneOf<D>>;
  literal: GetTypeFromLiteral<D>;
  enumInstance: GetTypeFromEnum<D>;
  enumMember: GetTypeFromEnumMember<D>;
  invalid: never;
}[EnsureIsKey<Exclude<keyof D, typeof dataTypeSymbol>>];

export type ParseBasicDataType<D extends BasicDataType> = {
  unknown: unknown;
  string: string;
  number: number;
  integer: number;
  boolean: boolean;
  symbol: symbol;
  function: UnknownFunction;
  null: null;
  undefined: undefined;
  stringnumeral: `${number}`;
  stringinteger: `${number}`;
}[D];

export type ParseDataType<D> = D extends BasicDataType
  ? ParseBasicDataType<D>
  : D extends ComplexDataType
  ? ParseComplexType<D>
  : never;

export type ParseRecordType<S extends RecordOf> = {
  [K in ExcludeRequired<S["recordOf"]>]?: ParseDataType<
    GetDescriptorType<S["recordOf"][K]>
  >;
} & {
  [K in ExcludeOptional<S["recordOf"]>]: ParseDataType<
    GetDescriptorType<S["recordOf"][K]>
  >;
};

export type GetDataType<D extends AllDataTypes> = ReWrap<ParseDataType<D>>;
