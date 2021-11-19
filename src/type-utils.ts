import { AllDataTypes } from ".";
import type {
  ArrayOf,
  BasicDataType,
  ComplexDataType,
  Enum,
  EnumMember,
  Literal,
  OneOf,
  RecordOf,
  SetOf,
  TypeSchema,
} from "./types";

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

export type ExcludeRequired<S extends TypeSchema> = EnsureStringType<
  Exclude<
    ValueOf<{
      [K in keyof S]: S[K]["required"] extends false ? K : undefined;
    }>,
    undefined
  >
>;

export type ExcludeOptional<S extends TypeSchema> = EnsureStringType<
  Exclude<
    ValueOf<{
      [K in keyof S]: S[K]["required"] extends false ? undefined : K;
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
  : "recordOf";

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
}[EnsureIsKey<keyof D>];

export type ParseBasicDataType<D extends BasicDataType> = {
  unknown: unknown;
  string: string;
  number: number;
  boolean: boolean;
  symbol: symbol;
  function: UnknownFunction;
  null: null;
  undefined: undefined;
}[D];

export type ParseDataType<D> = D extends BasicDataType
  ? ParseBasicDataType<D>
  : D extends ComplexDataType
  ? ParseComplexType<D>
  : never;

export type ParseRecordType<S extends RecordOf> = {
  [K in ExcludeRequired<S["recordOf"]>]?: ParseDataType<
    S["recordOf"][K]["type"]
  >;
} & {
  [K in ExcludeOptional<S["recordOf"]>]: ParseDataType<
    S["recordOf"][K]["type"]
  >;
};

export type GetDataType<D extends AllDataTypes> = ReWrap<ParseDataType<D>>;
