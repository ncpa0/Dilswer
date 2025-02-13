import type {
  ExcludeOptional,
  ExcludeRequired,
  GetDescriptorType,
  GetTypeFromCustom,
  ParseBasicDataType,
} from "@DataTypes/type-utils";
import type {
  AnyDataType,
  BasicDataType,
  ComplexDataType,
  RecordTypeSchema,
} from "./types";
import type { ArrayType } from "./types/array";
import type { DictType } from "./types/dict";
import type { EnumType } from "./types/enum";
import type { EnumMemberType } from "./types/enum-member";
import type { IntersectionType } from "./types/intersection";
import type { LiteralType } from "./types/literal";
import type { RecordType } from "./types/record";
import type { RecursiveType, RecursiveTypeReference } from "./types/recursive";
import type { SetType } from "./types/set";
import type { StringMatchingType } from "./types/string-matching";
import type { TupleType } from "./types/tuple";
import type { UnionType } from "./types/union";

type IsDefaultReplacement<W extends ReplacementType<any>> = W extends
  DefaultReplacementType<any> ? true : false;

type ChangeDefault<
  W extends ReplacementType<any>,
  T,
> = IsDefaultReplacement<W> extends true ? ReplacementType<T> : W;

class ReplacementType<T> {
  public t!: T;
  T!: T;
}

class DefaultReplacementType<T> extends ReplacementType<T> {
  isDefault!: true;
}

type ReplaceIfRef<T, W extends ReplacementType<any>> = T extends
  RecursiveTypeReference ? W["T"]
  : ParseCircularDataType<T, W>;

type MapRecordTypeSchema<
  S extends RecordTypeSchema,
  W extends ReplacementType<any>,
> =
  & {
    [K in ExcludeRequired<S>]?: ReplaceIfRef<GetDescriptorType<S[K]>, W>;
  }
  & {
    [K in ExcludeOptional<S>]: ReplaceIfRef<GetDescriptorType<S[K]>, W>;
  };

type MapToIntersection<
  T extends any[],
  W extends ReplacementType<any>,
> = T extends [infer A, ...infer B] ? B["length"] extends 0 ? ReplaceIfRef<A, W>
  : ReplaceIfRef<A, W> & MapToIntersection<B, W>
  : never;

type MapToUnion<T extends any[], W extends ReplacementType<any>> = T extends [
  infer A,
  ...infer B,
] ? ReplaceIfRef<A, W> | MapToUnion<B, W>
  : never;

type MapTupleType<T extends any[], W extends ReplacementType<any>> = T extends [
  infer A,
  ...infer B,
] ? [ReplaceIfRef<A, W>, ...MapTupleType<B, W>]
  : [];

type CircularTypesMap<D extends AnyDataType, W extends ReplacementType<any>> = {
  array: D extends ArrayType<infer T>
    ? Array<MapToUnion<T, ChangeDefault<W, any>>>
    : never;
  tuple: D extends TupleType<infer T> ? MapTupleType<T, ChangeDefault<W, any>>
    : never;
  record: D extends RecordType<infer T>
    ? MapRecordTypeSchema<T, ChangeDefault<W, any>>
    : never;
  dictionary: D extends DictType<infer T>
    ? Record<string | number, MapToUnion<T, ChangeDefault<W, any>>>
    : never;
  set: D extends SetType<infer T> ? Set<MapToUnion<T, ChangeDefault<W, any>>>
    : never;
  union: D extends UnionType<infer T> ? MapToUnion<T, ChangeDefault<W, any>>
    : never;
  intersection: D extends IntersectionType<infer T>
    ? MapToIntersection<T, ChangeDefault<W, any>>
    : never;
  literal: D extends LiteralType<infer T> ? T : never;
  enumUnion: D extends EnumType<infer T> ? T : never;
  enumMember: D extends EnumMemberType<infer T> ? T : never;
  instanceOf: D extends InstanceType<infer T> ? InstanceType<T> : never;
  custom: D extends ComplexDataType ? GetTypeFromCustom<D> : never;
  stringMatching: D extends StringMatchingType<infer T> ? T : never;
  circular: D extends RecursiveType ? GetTypeFromCircular<D> : never;
};

type ReplaceCircularRefs<
  D extends AnyDataType,
  W extends ReplacementType<any>,
> = D["kind"] extends keyof CircularTypesMap<D, W>
  ? CircularTypesMap<D, W>[D["kind"]]
  : D;

export type CircularType<T extends AnyDataType> = ReplaceCircularRefs<
  T,
  ReplacementType<
    ReplaceCircularRefs<
      T,
      ReplacementType<
        ReplaceCircularRefs<
          T,
          ReplacementType<
            ReplaceCircularRefs<T, DefaultReplacementType<any>>
          >
        >
      >
    >
  >
>;

export type GetTypeFromCircular<D extends ComplexDataType> = D extends
  RecursiveType<
    infer T
  > ? CircularType<T>
  : never;

export type ParseCircularDataType<
  D,
  W extends ReplacementType<any>,
> = D extends BasicDataType ? ParseBasicDataType<D["simpleType"]>
  : D extends ComplexDataType ? ReplaceCircularRefs<D, W>
  : never;
