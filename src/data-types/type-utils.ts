import type { GetTypeFromCircular } from "@DataTypes/circular-type-utils";
import type { InstanceOf, StringMatching, Tuple } from "@DataTypes/data-types";
import type {
  AllOf,
  AnyDataType,
  ArrayOf,
  BasicDataType,
  ComplexDataType,
  Custom,
  Dict,
  Enum,
  EnumMember,
  FieldDescriptor,
  Literal,
  OneOf,
  RecordOf,
  RecordTypeSchema,
  SetOf,
} from "@DataTypes/types";

type ParseDataTypeIntersectionTuple<
  T extends any[],
  U = ParseDataType<T[0]>
> = T extends [infer A, ...infer B]
  ? ParseDataTypeIntersectionTuple<B, U & ParseDataType<A>>
  : U;

export type GetDescriptorType<T extends AnyDataType | FieldDescriptor> =
  T extends { kind: any } ? T : T extends FieldDescriptor ? T["type"] : T;

type IsRequiredDescriptor<T extends AnyDataType | FieldDescriptor> =
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

export type GetTypeFromArrayOf<D extends ComplexDataType> = D extends ArrayOf<
  infer T
>
  ? T[number]
  : never;

export type GetFieldDescriptorsFromSetOf<D extends ComplexDataType> =
  D extends SetOf<infer T> ? T[number] : never;

export type GetTypeFromRecordOf<D extends ComplexDataType> =
  D extends RecordOf<any> ? D : never;

export type GetTypeFromDict<D extends ComplexDataType> = D extends Dict<infer T>
  ? T[number]
  : never;

export type GetTypeFromOneOf<D extends ComplexDataType> = D extends OneOf<
  infer T
>
  ? T[number]
  : never;

export type GetTypeFromAllOf<D extends ComplexDataType> = D extends AllOf<
  infer T
>
  ? ParseDataTypeIntersectionTuple<T>
  : never;

export type GetTypeFromLiteral<D extends ComplexDataType> = D extends Literal<
  infer T
>
  ? T
  : never;

export type GetTypeFromEnum<D extends ComplexDataType> = D extends Enum<infer T>
  ? T
  : never;

export type GetTypeFromInstanceOf<D extends ComplexDataType> =
  D extends InstanceOf<infer T> ? InstanceType<T> : never;

export type GetTypeFromCustom<D extends ComplexDataType> = D extends Custom<
  infer F
>
  ? F extends (v: any) => v is infer R
    ? R
    : unknown
  : never;

export type GetTypeFromEnumMember<D extends ComplexDataType> =
  D extends EnumMember<infer T> ? T : never;

type RepackTuple<T extends AnyDataType[]> = T extends [
  infer A extends AnyDataType,
  ...infer B extends AnyDataType[]
]
  ? [ParseDataType<A>, ...RepackTuple<B>]
  : [];

export type GetTypeFromTuple<D extends ComplexDataType> = D extends Tuple<
  infer T
>
  ? RepackTuple<T>
  : never;

export type GetTypeFromStringMatching<D extends ComplexDataType> =
  D extends StringMatching<infer T> ? T : never;

type TypeMap<D extends ComplexDataType> = {
  array: Array<ParseDataType<GetTypeFromArrayOf<D>>>;
  tuple: GetTypeFromTuple<D>;
  record: ParseRecordType<GetTypeFromRecordOf<D>>;
  dictionary: Record<string | number, ParseDataType<GetTypeFromDict<D>>>;
  set: Set<ParseDataType<GetFieldDescriptorsFromSetOf<D>>>;
  union: ParseDataType<GetTypeFromOneOf<D>>;
  intersection: GetTypeFromAllOf<D>;
  literal: GetTypeFromLiteral<D>;
  enumUnion: GetTypeFromEnum<D>;
  enumMember: GetTypeFromEnumMember<D>;
  instanceOf: GetTypeFromInstanceOf<D>;
  custom: GetTypeFromCustom<D>;
  stringMatching: GetTypeFromStringMatching<D>;
  circular: GetTypeFromCircular<D>;
};

export type ParseComplexType<D extends ComplexDataType> =
  D["kind"] extends keyof TypeMap<D> ? TypeMap<D>[D["kind"]] : never;

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
}[D["simpleType"]];

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

export type GetDataType<D extends AnyDataType> = ReWrap<ParseDataType<D>>;
