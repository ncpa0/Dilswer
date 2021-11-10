import { AllDataTypes } from ".";
import type { ArrayOf, OneOf, RecordOf, SetOf, TypeSchema } from "./types";
export declare const BasicDataTypes: {
    readonly Unknown: "unknown";
    readonly String: "string";
    readonly Number: "number";
    readonly Boolean: "boolean";
    readonly Symbol: "symbol";
    readonly Function: "function";
};
export declare const DataType: {
    RecordOf<TS extends TypeSchema>(args: TS): RecordOf<TS>;
    ArrayOf<DT extends AllDataTypes[]>(...args: DT): ArrayOf<DT>;
    SetOf<DT_1 extends AllDataTypes[]>(...args: DT_1): SetOf<DT_1>;
    OneOf<DT_2 extends AllDataTypes[]>(...args: DT_2): OneOf<DT_2>;
    Unknown: "unknown";
    String: "string";
    Number: "number";
    Boolean: "boolean";
    Symbol: "symbol";
    Function: "function";
};
