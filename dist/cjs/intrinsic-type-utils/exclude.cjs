"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/intrinsic-type-utils/exclude.ts
var exclude_exports = {};
__export(exclude_exports, {
  Exclude: () => Exclude
});
module.exports = __toCommonJS(exclude_exports);
var import_data_types = require("../data-types/data-types.cjs");
var Exclude = (union, ...excludeTypes) => {
  return {
    [import_data_types.dataTypeSymbol]: true,
    oneOf: union.oneOf.filter((t) => !excludeTypes.includes(t))
  };
};
