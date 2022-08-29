import type {
  AllDataTypes,
  BasicDataType,
  FieldDescriptor,
  OneOf,
  RecordOf,
  RecordTypeSchema,
} from "@DataTypes/types";

type GetType<T extends AllDataTypes | FieldDescriptor> =
  T extends FieldDescriptor ? T["type"] : T;

export type RequiredRecord<R extends RecordTypeSchema> = RecordOf<{
  [K in keyof R]: { required: true; type: GetType<R[K]> };
}>;

export type PartialRecord<R extends RecordTypeSchema> = RecordOf<{
  [K in keyof R]: { required: false; type: GetType<R[K]> };
}>;

export type OmitRecord<
  R extends RecordTypeSchema,
  OK extends keyof R
> = RecordOf<{
  [K in keyof R as K extends OK ? never : K]: R[K];
}>;

export type PickRecord<
  R extends RecordTypeSchema,
  PK extends keyof R
> = RecordOf<{
  [K in keyof R as K extends PK ? K : never]: R[K];
}>;

export type SumRecord<
  R1 extends RecordTypeSchema,
  R2 extends RecordTypeSchema
> = RecordOf<
  {
    [K in keyof R1 as K extends keyof R2 ? never : K]: R1[K];
  } & R2
>;

export type ExcludeOneOf<U extends OneOf, E extends BasicDataType> = OneOf<
  Array<Exclude<U["oneOf"][number], E>>
>;
