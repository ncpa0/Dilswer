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

// src/validation-algorithms/validation-error/validation-error.ts
var validation_error_exports = {};
__export(validation_error_exports, {
  ValidationError: () => ValidationError
});
module.exports = __toCommonJS(validation_error_exports);
var ValidationError = class extends TypeError {
  constructor(path, expected, value) {
    super("Value does not conform the data type structure definition.");
    this._validation_error = true;
    this.expectedValueType = expected;
    this.fieldPath = path;
    this.receivedValue = value;
  }
  static isValidationError(e) {
    return typeof e === "object" && e !== null && e instanceof Error && "_validation_error" in e;
  }
};
