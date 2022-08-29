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

// src/validation-algorithms/validators/validate-primitive.ts
var validate_primitive_exports = {};
__export(validate_primitive_exports, {
  validatePrimitive: () => validatePrimitive
});
module.exports = __toCommonJS(validate_primitive_exports);
var import_validation_error = require("../validation-error/validation-error.cjs");
var import_validate_string_integer = require("./validate-string-integer.cjs");
var import_validate_string_numeral = require("./validate-string-numeral.cjs");
var validatePrimitive = (path, type, data) => {
  const throwError = () => {
    throw new import_validation_error.ValidationError(path, type, data);
  };
  if (type === "unknown")
    return;
  if (type === "null" && data === null)
    return;
  if (type === "stringnumeral") {
    return (0, import_validate_string_numeral.validateStringNumeral)(path, type, data);
  }
  if (type === "stringinteger") {
    return (0, import_validate_string_integer.validateStringInteger)(path, type, data);
  }
  if (type === "integer") {
    if (typeof data !== "number" || !Number.isInteger(data))
      throwError();
    else
      return;
  }
  if (type === "number") {
    if (typeof data !== "number" || Number.isNaN(data))
      throwError();
    else
      return;
  }
  if (typeof data === type)
    return;
  throwError();
};
