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

// src/validation-algorithms/validators/validate-one-of.ts
var validate_one_of_exports = {};
__export(validate_one_of_exports, {
  validateOneOf: () => validateOneOf
});
module.exports = __toCommonJS(validate_one_of_exports);
var import_validation_error = require("../validation-error/validation-error.cjs");
var import_validate_type = require("./validate-type.cjs");
var validateOneOf = (path, type, data) => {
  let passed = false;
  for (const dataType of type.oneOf) {
    try {
      (0, import_validate_type.validateType)(path, dataType, data);
      passed = true;
      break;
    } catch (e) {
      continue;
    }
  }
  if (passed)
    return;
  throw new import_validation_error.ValidationError(path, type, data);
};
