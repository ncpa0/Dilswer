import type { GetTypeFromCircular } from "@DataTypes/circular-type-utils";
import type {
  AnyDataType,
  BasicDataType,
  BasicTypeNames,
  ComplexDataType,
  FieldDescriptor,
  RecordTypeSchema,
} from "./types";
import type { ArrayType } from "./types/array";
import type { CustomType } from "./types/custom";
import type { DictType } from "./types/dict";
import type { EnumType } from "./types/enum";
import type { EnumMemberType } from "./types/enum-member";
import type { InstanceOfType } from "./types/instance";
import type { IntersectionType } from "./types/intersection";
import type { LiteralType } from "./types/literal";
import type { RecordType } from "./types/record";
import type { SetType } from "./types/set";
import type { StringMatchingType } from "./types/string-matching";
import type { TupleType } from "./types/tuple";
import type { UnionType } from "./types/union";

export type ParseDataTypeIntersectionTuple<
  T extends any[],
  U = ParseDataType<T[0]>,
> = T extends [infer A, ...infer B]
  ? ParseDataTypeIntersectionTuple<B, U & ParseDataType<A>>
  : U;

export type GetDescriptorType<T extends AnyDataType | FieldDescriptor> =
  T extends { kind: any } ? T : T extends FieldDescriptor ? T["type"] : T;

type IsRequiredDescriptor<T extends AnyDataType | FieldDescriptor> = T extends
  FieldDescriptor ? T["required"] : true;

export type ValueOf<R extends Record<any, any>> = R extends Record<any, infer T>
  ? T
  : never;

export type UnknownFunction = (...args: unknown[]) => unknown;

export class Static<T> {
  private _t!: T;
}

export type ReWrap<T> = T extends Function ? T
  : T extends Static<infer U> ? U
  : T extends Set<infer ST> ? Set<ReWrap<ST>>
  : T extends object ? T extends infer O ? { [K in keyof O]: ReWrap<O[K]> }
    : never
  : T;

export type EnsureStringType<T> = T extends string ? T : string;

export type ExcludeRequired<S extends RecordTypeSchema> = EnsureStringType<
  Exclude<
    ValueOf<
      {
        [K in keyof S]: IsRequiredDescriptor<S[K]> extends false ? K
          : undefined;
      }
    >,
    undefined
  >
>;

export type ExcludeOptional<S extends RecordTypeSchema> = EnsureStringType<
  Exclude<
    ValueOf<
      {
        [K in keyof S]: IsRequiredDescriptor<S[K]> extends false ? undefined
          : K;
      }
    >,
    undefined
  >
>;

export type GetTypeFromArrayOf<D extends ComplexDataType> = D extends ArrayType<
  infer T
> ? T[number]
  : never;

export type GetFieldDescriptorsFromSetOf<D extends ComplexDataType> = D extends
  SetType<infer T> ? T[number] : never;

export type GetTypeFromRecordOf<D extends ComplexDataType> = D extends
  RecordType<infer T> ? T : never;

export type GetTypeFromDict<D extends ComplexDataType> = D extends
  DictType<infer T> ? T[number]
  : never;

export type GetTypeFromOneOf<D extends ComplexDataType> = D extends UnionType<
  infer T
> ? T[number]
  : never;

export type GetTypeFromAllOf<D extends ComplexDataType> = D extends
  IntersectionType<
    infer T
  > ? ParseDataTypeIntersectionTuple<T>
  : never;

export type GetTypeFromLiteral<D extends ComplexDataType> = D extends
  LiteralType<
    infer T
  > ? T
  : never;

export type GetTypeFromEnum<D extends ComplexDataType> = D extends
  EnumType<infer T> ? T
  : never;

export type GetTypeFromInstanceOf<D extends ComplexDataType> = D extends
  InstanceOfType<infer T> ? Static<T> : never;

export type GetFnAssertType<T> = T extends (v: any) => v is infer R ? R
  : unknown;

export type GetTypeFromCustom<D extends ComplexDataType> = D extends CustomType<
  infer F
> ? GetFnAssertType<F>
  : never;

export type GetTypeFromEnumMember<D extends ComplexDataType> = D extends
  EnumMemberType<infer T> ? T : never;

export type RepackTuple<T extends AnyDataType[]> = T extends [
  infer A extends AnyDataType,
  ...infer B extends AnyDataType[],
] ? [ParseDataType<A>, ...RepackTuple<B>]
  : [];

export type GetTypeFromTuple<D extends ComplexDataType> = D extends TupleType<
  infer T
> ? RepackTuple<T>
  : never;

export type GetTypeFromStringMatching<D extends ComplexDataType> = D extends
  StringMatchingType<infer T> ? T : never;

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

export type ParseComplexType<D extends ComplexDataType> = D["kind"] extends
  keyof TypeMap<D> ? TypeMap<D>[D["kind"]] : never;

export type ParseBasicDataType<D extends BasicTypeNames> = {
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
  ? ParseBasicDataType<D["simpleType"]>
  : D extends ComplexDataType ? ParseComplexType<D>
  : never;

export type ParseRecordType<S extends RecordTypeSchema> =
  & {
    [K in ExcludeRequired<S>]?: ParseDataType<
      GetDescriptorType<S[K]>
    >;
  }
  & {
    [K in ExcludeOptional<S>]: ParseDataType<
      GetDescriptorType<S[K]>
    >;
  };

export type GetDataType<D extends AnyDataType> = ReWrap<ParseDataType<D>>;
