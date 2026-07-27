import type {
  AnyType,
  BasicType,
  ComplexType,
  RecordTypeSchema,
} from "@DataTypes/type-types";
import type {
  ExcludeOptional,
  ExcludeRequired,
  GetDescriptorType,
  GetTypeFromCustom,
  ParseBasicDataType,
} from "@DataTypes/type-utils";
import type { ArrayType } from "@DataTypes/types/array";
import type { DictType } from "@DataTypes/types/dict";
import type { EnumType } from "@DataTypes/types/enum";
import type { EnumMemberType } from "@DataTypes/types/enum-member";
import type { IntersectionType } from "@DataTypes/types/intersection";
import type { LiteralType } from "@DataTypes/types/literal";
import type { RecordType } from "@DataTypes/types/record";
import type {
  RecursiveType,
  RecursiveTypeReference,
} from "@DataTypes/types/recursive";
import type { SetType } from "@DataTypes/types/set";
import type { StringMatchingType } from "@DataTypes/types/string-matching";
import type { TupleType } from "@DataTypes/types/tuple";
import type { UnionType } from "@DataTypes/types/union";

export type IsDefaultReplacement<W extends ReplacementType<any>> = W extends
  DefaultReplacementType<any> ? true : false;

export type ChangeDefault<
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

export type { DefaultReplacementType, ReplacementType };

export type ReplaceIfRef<T, W extends ReplacementType<any>> = T extends
  RecursiveTypeReference ? W["T"]
  : ParseRecursiveDataType<T, W>;

export type MapRecordTypeSchema<
  S extends RecordTypeSchema,
  W extends ReplacementType<any>,
> =
  & {
    [K in ExcludeRequired<S>]?: ReplaceIfRef<GetDescriptorType<S[K]>, W>;
  }
  & {
    [K in ExcludeOptional<S>]: ReplaceIfRef<GetDescriptorType<S[K]>, W>;
  };

export type MapToIntersection<
  T extends any[],
  W extends ReplacementType<any>,
> = T extends [infer A, ...infer B] ? B["length"] extends 0 ? ReplaceIfRef<A, W>
  : ReplaceIfRef<A, W> & MapToIntersection<B, W>
  : never;

export type MapToUnion<T extends any[], W extends ReplacementType<any>> =
  T extends [
    infer A,
    ...infer B,
  ] ? ReplaceIfRef<A, W> | MapToUnion<B, W>
    : never;

export type MapTupleType<T extends any[], W extends ReplacementType<any>> =
  T extends [
    infer A,
    ...infer B,
  ] ? [ReplaceIfRef<A, W>, ...MapTupleType<B, W>]
    : [];

export type RecursiveTypesMap<
  D extends AnyType,
  W extends ReplacementType<any>,
> = {
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
  custom: D extends ComplexType ? GetTypeFromCustom<D> : never;
  stringMatching: D extends StringMatchingType<infer T> ? T : never;
  circular: D extends RecursiveType ? GetTypeFromRecursive<D> : never;
};

export type ReplaceRecursiveRefs<
  D extends AnyType,
  W extends ReplacementType<any>,
> = D["kind"] extends keyof RecursiveTypesMap<D, W>
  ? RecursiveTypesMap<D, W>[D["kind"]]
  : D;

export type UnRecursiveType<T extends AnyType> = ReplaceRecursiveRefs<
  T,
  ReplacementType<
    ReplaceRecursiveRefs<
      T,
      ReplacementType<
        ReplaceRecursiveRefs<
          T,
          ReplacementType<
            ReplaceRecursiveRefs<T, DefaultReplacementType<any>>
          >
        >
      >
    >
  >
>;

export type GetTypeFromRecursive<D extends ComplexType> = D extends
  RecursiveType<
    infer T
  > ? UnRecursiveType<T>
  : never;

export type ParseRecursiveDataType<
  D,
  W extends ReplacementType<any>,
> = D extends BasicType ? ParseBasicDataType<D["simpleType"]>
  : D extends ComplexType ? ReplaceRecursiveRefs<D, W>
  : never;
