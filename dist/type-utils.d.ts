import { AllDataTypes } from ".";
import type { ArrayOf, BasicDataType, ComplexDataType, OneOf, RecordOf, SetOf, TypeSchema } from "./types";
export declare type ValueOf<R extends Record<any, any>> = R extends Record<any, infer T> ? T : never;
export declare type UnknownFunction = (...args: unknown[]) => unknown;
export declare type ReWrap<T> = T extends Function ? T : T extends Set<infer ST> ? Set<ReWrap<ST>> : T extends object ? T extends infer O ? {
    [K in keyof O]: ReWrap<O[K]>;
} : never : T;
export declare type EnsureStringType<T> = T extends string ? T : string;
export declare type ExcludeRequired<S extends TypeSchema> = EnsureStringType<Exclude<ValueOf<{
    [K in keyof S]: S[K]["required"] extends false ? K : undefined;
}>, undefined>>;
export declare type ExcludeOptional<S extends TypeSchema> = EnsureStringType<Exclude<ValueOf<{
    [K in keyof S]: S[K]["required"] extends false ? undefined : K;
}>, undefined>>;
export declare type EnsureIsKey<K> = K extends "arrayOf" | "recordOf" | "setOf" | "oneOf" ? K : "recordOf";
export declare type GetTypeFromArrayOf<D extends ComplexDataType> = D extends ArrayOf<any> ? D["arrayOf"][number] : never;
export declare type GetFieldDescriptorsFromSetOf<D extends ComplexDataType> = D extends SetOf<any> ? D["setOf"][number] : never;
export declare type GetTypeFromRecordOf<D extends ComplexDataType> = D extends RecordOf<any> ? D : never;
export declare type GetTypeFromOneOf<D extends ComplexDataType> = D extends OneOf<any> ? D["oneOf"][number] : never;
export declare type ParseComplexType<D extends ComplexDataType> = {
    arrayOf: Array<ParseDataType<GetTypeFromArrayOf<D>>>;
    recordOf: ParseRecordType<GetTypeFromRecordOf<D>>;
    setOf: Set<ParseDataType<GetFieldDescriptorsFromSetOf<D>>>;
    oneOf: ParseDataType<GetTypeFromOneOf<D>>;
}[EnsureIsKey<keyof D>];
export declare type ParseBasicDataType<D extends BasicDataType> = {
    unknown: unknown;
    string: string;
    number: number;
    boolean: boolean;
    symbol: symbol;
    function: UnknownFunction;
}[D];
export declare type ParseDataType<D> = D extends BasicDataType ? ParseBasicDataType<D> : D extends ComplexDataType ? ParseComplexType<D> : never;
export declare type ParseRecordType<S extends RecordOf> = {
    [K in ExcludeRequired<S["recordOf"]>]?: ParseDataType<S["recordOf"][K]["type"]>;
} & {
    [K in ExcludeOptional<S["recordOf"]>]: ParseDataType<S["recordOf"][K]["type"]>;
};
export declare type GetDataType<D extends AllDataTypes> = ReWrap<ParseDataType<D>>;
