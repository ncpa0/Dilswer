"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataType = exports.BasicDataTypes = void 0;
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
        return { recordOf: args };
    },
    ArrayOf(...args) {
        return { arrayOf: args };
    },
    SetOf(...args) {
        return { setOf: args };
    },
    OneOf(...args) {
        return { oneOf: args };
    },
    Literal(value) {
        return { literal: value };
    },
    EnumMember(enumMember) {
        return { enumMember };
    },
    Enum(enumInstance) {
        // @ts-expect-error
        return { enumInstance };
    } });
