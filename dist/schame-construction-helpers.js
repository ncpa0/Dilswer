"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.DataType = __assign(__assign({}, exports.BasicDataTypes), { RecordOf: function (args) {
        return { recordOf: args };
    }, ArrayOf: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return { arrayOf: args };
    }, SetOf: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return { setOf: args };
    }, OneOf: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return { oneOf: args };
    }, Literal: function (value) {
        return { literal: value };
    }, EnumMember: function (enumMember) {
        return { enumMember: enumMember };
    }, Enum: function (enumInstance) {
        // @ts-expect-error
        return { enumInstance: enumInstance };
    } });
