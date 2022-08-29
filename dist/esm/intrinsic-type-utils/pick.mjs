var __defProp = Object.defineProperty;
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

// src/intrinsic-type-utils/pick.ts
import { dataTypeSymbol } from "../data-types/data-types.mjs";
var Pick = (recordDataType, ...pickKeys) => {
  return {
    [dataTypeSymbol]: true,
    recordOf: Object.fromEntries(
      Object.entries(recordDataType.recordOf).filter(([key]) => pickKeys.includes(key)).map(([key, desc]) => [
        key,
        typeof desc === "object" && desc !== null ? __spreadValues({}, desc) : desc
      ])
    )
  };
};
export {
  Pick
};
