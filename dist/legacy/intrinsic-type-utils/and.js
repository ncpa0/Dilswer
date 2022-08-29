"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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

// src/intrinsic-type-utils/and.ts
var and_exports = {};
__export(and_exports, {
  And: () => And
});
module.exports = __toCommonJS(and_exports);
var import_data_types = require("../data-types/data-types.js");
var And = (recordDataTypeA, recordDataTypeB) => {
  return {
    [import_data_types.dataTypeSymbol]: true,
    recordOf: __spreadValues(__spreadValues({}, Object.fromEntries(
      Object.entries(recordDataTypeA.recordOf).map(([key, desc]) => [
        key,
        typeof desc === "object" && desc !== null ? __spreadValues({}, desc) : desc
      ])
    )), Object.fromEntries(
      Object.entries(recordDataTypeB.recordOf).map(([key, desc]) => [
        key,
        typeof desc === "object" && desc !== null ? __spreadValues({}, desc) : desc
      ])
    ))
  };
};
