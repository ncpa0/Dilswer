import type {
  AnyType,
  BasicType,
  FieldDescriptor,
  RecordTypeSchema,
} from "@DataTypes/types";
import { RecordType } from "@DataTypes/types/record";
import { UnionType } from "@DataTypes/types/union";

type GetType<T extends AnyType | FieldDescriptor> = T extends FieldDescriptor
  ? T["type"]
  : T;

export type RequiredRecord<R extends RecordTypeSchema> = RecordType<
  {
    [K in keyof R]: { required: true; type: GetType<R[K]> };
  }
>;

export type PartialRecord<R extends RecordTypeSchema> = RecordType<
  {
    [K in keyof R]: { required: false; type: GetType<R[K]> };
  }
>;

export type OmitRecord<
  R extends RecordTypeSchema,
  OK extends keyof R,
> = RecordType<
  {
    [K in keyof R as K extends OK ? never : K]: R[K];
  }
>;

export type PickRecord<
  R extends RecordTypeSchema,
  PK extends keyof R,
> = RecordType<
  {
    [K in keyof R as K extends PK ? K : never]: R[K];
  }
>;

export type SumRecord<
  R1 extends RecordTypeSchema,
  R2 extends RecordTypeSchema,
> = RecordType<
  {
    [K in keyof R1 as K extends keyof R2 ? never : K]: R1[K];
  } & R2
>;

export type ExcludeOneOf<U extends UnionType, E extends BasicType> = UnionType<
  Array<Exclude<U["oneOf"][number], E>>
>;
