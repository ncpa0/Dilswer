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

// src/validation-algorithms/create-validator.ts
var create_validator_exports = {};
__export(create_validator_exports, {
  createChecker: () => createChecker,
  createValidator: () => createValidator
});
module.exports = __toCommonJS(create_validator_exports);
var import_validate_type = require("./validators/validate-type.cjs");
var createValidator = (dataType) => {
  const validator = (data) => {
    try {
      (0, import_validate_type.validateType)("$", dataType, data);
      return true;
    } catch (e) {
      return false;
    }
  };
  return validator;
};
var createChecker = createValidator;
