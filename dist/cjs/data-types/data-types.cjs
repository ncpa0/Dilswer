"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/data-types/data-types.ts
var data_types_exports = {};
__export(data_types_exports, {
  BasicDataTypes: () => BasicDataTypes,
  DataType: () => DataType,
  dataTypeSymbol: () => dataTypeSymbol
});
module.exports = __toCommonJS(data_types_exports);
var dataTypeSymbol = Symbol();
var BasicDataTypes = {
  Unknown: "unknown",
  String: "string",
  Number: "number",
  Int: "integer",
  Boolean: "boolean",
  Symbol: "symbol",
  Function: "function",
  Null: "null",
  Undefined: "undefined",
  StringNumeral: "stringnumeral",
  StringInt: "stringinteger"
};
var DataType = __spreadProps(__spreadValues({}, BasicDataTypes), {
  RecordOf(args) {
    return {
      [dataTypeSymbol]: true,
      recordOf: args
    };
  },
  ArrayOf(...args) {
    return {
      [dataTypeSymbol]: true,
      arrayOf: args
    };
  },
  SetOf(...args) {
    return {
      [dataTypeSymbol]: true,
      setOf: args
    };
  },
  OneOf(...args) {
    return {
      [dataTypeSymbol]: true,
      oneOf: args
    };
  },
  Literal(value) {
    return {
      [dataTypeSymbol]: true,
      literal: value
    };
  },
  EnumMember(enumMember) {
    return {
      [dataTypeSymbol]: true,
      enumMember
    };
  },
  Enum(enumInstance) {
    return {
      [dataTypeSymbol]: true,
      enumInstance
    };
  }
});
