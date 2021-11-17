import type { BasicDataTypes } from "./schame-construction-helpers";
import type { ValueOf } from "./type-utils";
export declare type ArrayOf<DT extends AllDataTypes[] = any[]> = {
    arrayOf: DT;
};
export declare type RecordOf<TS extends TypeSchema = TypeSchema> = {
    recordOf: TS;
};
export declare type SetOf<DT extends AllDataTypes[] = any[]> = {
    setOf: DT;
};
export declare type OneOf<DT extends AllDataTypes[] = any[]> = {
    oneOf: DT;
};
export declare type Enum<E = any> = {
    enumInstance: E;
};
export declare type EnumMember<M = any> = {
    enumMember: M;
};
export declare type BasicDataType = ValueOf<typeof BasicDataTypes>;
export declare type ComplexDataType = ArrayOf | RecordOf | SetOf | OneOf | Enum | EnumMember;
export declare type AllDataTypes = BasicDataType | ComplexDataType;
export declare type FieldDescriptor = {
    required?: boolean;
    type: AllDataTypes;
};
export declare type TypeSchema = Record<string, FieldDescriptor>;
