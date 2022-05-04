import type { BasicDataTypes, dataTypeSymbol } from "./type-def-helpers";
import type { ValueOf } from "./type-utils";
export declare type ArrayOf<DT extends AllDataTypes[] = any[]> = {
    readonly [dataTypeSymbol]: true;
    readonly arrayOf: DT;
};
export declare type RecordOf<TS extends RecordTypeSchema = RecordTypeSchema> = {
    readonly [dataTypeSymbol]: true;
    readonly recordOf: TS;
};
export declare type SetOf<DT extends AllDataTypes[] = any[]> = {
    readonly [dataTypeSymbol]: true;
    readonly setOf: DT;
};
export declare type OneOf<DT extends AllDataTypes[] = any[]> = {
    readonly [dataTypeSymbol]: true;
    readonly oneOf: DT;
};
export declare type Literal<V extends string | number | boolean = string | number | boolean> = {
    readonly [dataTypeSymbol]: true;
    readonly literal: V;
};
export declare type Enum<E = any> = {
    readonly [dataTypeSymbol]: true;
    readonly enumInstance: E;
};
export declare type EnumMember<M = any> = {
    readonly [dataTypeSymbol]: true;
    readonly enumMember: M;
};
export declare type BasicDataType = ValueOf<typeof BasicDataTypes>;
export declare type ComplexDataType = ArrayOf | RecordOf | SetOf | OneOf | Literal | Enum | EnumMember;
export declare type AllDataTypes = BasicDataType | ComplexDataType;
export declare type FieldDescriptor = {
    readonly required?: boolean;
    readonly type: AllDataTypes;
};
export interface RecordTypeSchema {
    readonly [key: string]: FieldDescriptor | AllDataTypes;
}
