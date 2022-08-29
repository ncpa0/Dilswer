var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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

// src/intrinsic-type-utils/partial.ts
import { dataTypeSymbol } from "../data-types/data-types.mjs";
import { isFieldDescriptor } from "../utilities/is-field-descriptor.mjs";
var Partial = (recordDataType) => {
  return {
    [dataTypeSymbol]: true,
    recordOf: Object.fromEntries(
      Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
        key,
        isFieldDescriptor(descriptor) ? __spreadProps(__spreadValues({}, descriptor), { required: false }) : { type: descriptor, required: false }
      ])
    )
  };
};
export {
  Partial
};
