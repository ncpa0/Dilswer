import type { AllDataTypes } from ".";
import type { ArrayOf, Enum, EnumMember, Literal, OneOf, RecordOf, SetOf, TypeSchema } from "./types";
export declare const BasicDataTypes: {
    readonly Unknown: "unknown";
    readonly String: "string";
    readonly Number: "number";
    readonly Boolean: "boolean";
    readonly Symbol: "symbol";
    readonly Function: "function";
    readonly Null: "null";
    readonly Undefined: "undefined";
};
export declare const DataType: {
    RecordOf<TS extends TypeSchema>(args: TS): RecordOf<TS>;
    ArrayOf<DT extends AllDataTypes[]>(...args: DT): ArrayOf<DT>;
    SetOf<DT_1 extends AllDataTypes[]>(...args: DT_1): SetOf<DT_1>;
    OneOf<DT_2 extends AllDataTypes[]>(...args: DT_2): OneOf<DT_2>;
    Literal<V extends string | number | boolean>(value: V): Literal<V>;
    EnumMember<M extends string | number>(enumMember: M): EnumMember<M>;
    Enum<T extends string, TEnumValue extends string | number>(enumInstance: { [key in T]: TEnumValue; }): Enum<TEnumValue>;
    Unknown: "unknown";
    String: "string";
    Number: "number";
    Boolean: "boolean";
    Symbol: "symbol";
    Function: "function";
    Null: "null";
    Undefined: "undefined";
};
