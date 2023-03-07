import type {
  Circular,
  CircularRef,
  InstanceOf,
  StringMatching,
  Tuple,
} from "@DataTypes/data-types";
import type {
  ExcludeOptional,
  ExcludeRequired,
  GetDescriptorType,
  GetTypeFromCustom,
  ParseBasicDataType,
} from "@DataTypes/type-utils";
import type {
  AllOf,
  AnyDataType,
  ArrayOf,
  BasicDataType,
  ComplexDataType,
  Dict,
  Enum,
  EnumMember,
  Literal,
  OneOf,
  RecordOf,
  RecordTypeSchema,
  SetOf,
} from "@DataTypes/types";

class Unique {
  private _!: never;
}
type ExtUnique<T> = T extends Unique ? true : false;
type IsAny<T> = true extends ExtUnique<T>
  ? false extends ExtUnique<T>
    ? true
    : false
  : false;

type IsDefaultReplacement<W extends ReplacementType<any>> =
  W extends DefaultReplacementType<any> ? true : false;

type ChangeDefault<
  W extends ReplacementType<any>,
  T
> = IsDefaultReplacement<W> extends true ? ReplacementType<T> : W;

class ReplacementType<T> {
  private t!: T;
  T!: T;
}

class DefaultReplacementType<T> extends ReplacementType<T> {
  isDefault!: true;
}

type ReplaceIfRef<T, W extends ReplacementType<any>> = T extends CircularRef
  ? W["T"]
  : ParseCircularDataType<T, W>;

type MapRecordTypeSchema<
  S extends RecordTypeSchema,
  W extends ReplacementType<any>
> = {
  [K in ExcludeRequired<S>]?: ReplaceIfRef<GetDescriptorType<S[K]>, W>;
} & {
  [K in ExcludeOptional<S>]: ReplaceIfRef<GetDescriptorType<S[K]>, W>;
};

type MapToIntersection<
  T extends any[],
  W extends ReplacementType<any>
> = T extends [infer A, ...infer B]
  ? B["length"] extends 0
    ? ReplaceIfRef<A, W>
    : ReplaceIfRef<A, W> & MapToIntersection<B, W>
  : never;

type MapToUnion<T extends any[], W extends ReplacementType<any>> = T extends [
  infer A,
  ...infer B
]
  ? ReplaceIfRef<A, W> | MapToUnion<B, W>
  : never;

type MapTupleType<T extends any[], W extends ReplacementType<any>> = T extends [
  infer A,
  ...infer B
]
  ? [ReplaceIfRef<A, W>, ...MapTupleType<B, W>]
  : [];

type CircularTypesMap<D extends AnyDataType, W extends ReplacementType<any>> = {
  array: D extends ArrayOf<infer T>
    ? Array<MapToUnion<T, ChangeDefault<W, any>>>
    : never;
  tuple: D extends Tuple<infer T>
    ? MapTupleType<T, ChangeDefault<W, any>>
    : never;
  record: D extends RecordOf<infer T>
    ? MapRecordTypeSchema<T, ChangeDefault<W, any>>
    : never;
  dictionary: D extends Dict<infer T>
    ? Record<string | number, MapToUnion<T, ChangeDefault<W, any>>>
    : never;
  set: D extends SetOf<infer T>
    ? Set<MapToUnion<T, ChangeDefault<W, any>>>
    : never;
  union: D extends OneOf<infer T>
    ? MapToUnion<T, ChangeDefault<W, any>>
    : never;
  intersection: D extends AllOf<infer T>
    ? MapToIntersection<T, ChangeDefault<W, any>>
    : never;
  literal: D extends Literal<infer T> ? T : never;
  enumUnion: D extends Enum<infer T> ? T : never;
  enumMember: D extends EnumMember<infer T> ? T : never;
  instanceOf: D extends InstanceOf<infer T> ? InstanceType<T> : never;
  custom: D extends ComplexDataType ? GetTypeFromCustom<D> : never;
  stringMatching: D extends StringMatching<infer T> ? T : never;
  circular: D extends Circular ? GetTypeFromCircular<D> : never;
};

type ReplaceCircularRefs<
  D extends AnyDataType,
  W extends ReplacementType<any>
> = D["kind"] extends keyof CircularTypesMap<D, W>
  ? CircularTypesMap<D, W>[D["kind"]]
  : D;

export type GetTypeFromCircular<D extends ComplexDataType> = D extends Circular<
  infer T
>
  ? ReplaceCircularRefs<
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
    >
  : never;

export type ParseCircularDataType<
  D,
  W extends ReplacementType<any>
> = D extends BasicDataType
  ? ParseBasicDataType<D>
  : D extends ComplexDataType
  ? ReplaceCircularRefs<D, W>
  : never;
