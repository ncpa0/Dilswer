"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataType = exports.BasicDataTypes = exports.dataTypeSymbol = void 0;
exports.dataTypeSymbol = Symbol();
exports.BasicDataTypes = {
    Unknown: "unknown",
    String: "string",
    Number: "number",
    Boolean: "boolean",
    Symbol: "symbol",
    Function: "function",
    Null: "null",
    Undefined: "undefined",
};
exports.DataType = Object.assign(Object.assign({}, exports.BasicDataTypes), { RecordOf(args) {
        return {
            [exports.dataTypeSymbol]: true,
            recordOf: args,
        };
    },
    ArrayOf(...args) {
        return {
            [exports.dataTypeSymbol]: true,
            arrayOf: args,
        };
    },
    SetOf(...args) {
        return {
            [exports.dataTypeSymbol]: true,
            setOf: args,
        };
    },
    OneOf(...args) {
        return {
            [exports.dataTypeSymbol]: true,
            oneOf: args,
        };
    },
    Literal(value) {
        return {
            [exports.dataTypeSymbol]: true,
            literal: value,
        };
    },
    EnumMember(enumMember) {
        return {
            [exports.dataTypeSymbol]: true,
            enumMember,
        };
    },
    Enum(enumInstance) {
        // @ts-expect-error
        return { enumInstance };
    } });
