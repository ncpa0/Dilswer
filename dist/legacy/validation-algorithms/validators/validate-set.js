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

// src/validation-algorithms/validators/validate-set.ts
var validate_set_exports = {};
__export(validate_set_exports, {
  validateSet: () => validateSet
});
module.exports = __toCommonJS(validate_set_exports);
var import_data_types = require("../../data-types/data-types.js");
var import_validation_error = require("../validation-error/validation-error.js");
var import_validate_one_of = require("./validate-one-of.js");
var isSet = (data) => {
  return typeof data === "object" && data !== null && data[Symbol.toStringTag] === "Set";
};
var validateSet = (path, type, data) => {
  if (!isSet(data))
    throw new import_validation_error.ValidationError(path, type, data);
  for (const elem of data) {
    (0, import_validate_one_of.validateOneOf)(`${path}.SET`, import_data_types.DataType.OneOf(...type.setOf), elem);
  }
};
