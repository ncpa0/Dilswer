import type { BasicDataTypes } from "./schame-construction-helpers";
import type { ValueOf } from "./type-utils";

export type ArrayOf<DT extends AllDataTypes[] = any[]> = {
  arrayOf: DT;
};

export type RecordOf<TS extends TypeSchema = TypeSchema> = {
  recordOf: TS;
};

export type SetOf<DT extends AllDataTypes[] = any[]> = {
  setOf: DT;
};

export type OneOf<DT extends AllDataTypes[] = any[]> = {
  oneOf: DT;
};

export type BasicDataType = ValueOf<typeof BasicDataTypes>;

export type ComplexDataType = ArrayOf | RecordOf | SetOf | OneOf;

export type AllDataTypes = BasicDataType | ComplexDataType;

export type FieldDescriptor = {
  required?: boolean;
  type: AllDataTypes;
};

export type TypeSchema = Record<string, FieldDescriptor>;
