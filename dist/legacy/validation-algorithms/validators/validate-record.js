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

// src/validation-algorithms/validators/validate-record.ts
var validate_record_exports = {};
__export(validate_record_exports, {
  validateRecord: () => validateRecord
});
module.exports = __toCommonJS(validate_record_exports);
var import_is_field_descriptor = require("../../utilities/is-field-descriptor.js");
var import_validation_error = require("../validation-error/validation-error.js");
var import_validate_type = require("./validate-type.js");
var getType = (v) => {
  if ((0, import_is_field_descriptor.isFieldDescriptor)(v))
    return v.type;
  return v;
};
var validateRecord = (path, type, data) => {
  if (typeof data !== "object" || data === null)
    throw new import_validation_error.ValidationError(path, type, data);
  for (const [key, fieldDescriptor] of Object.entries(type.recordOf)) {
    if (!(key in data)) {
      if ((0, import_is_field_descriptor.isFieldDescriptor)(fieldDescriptor)) {
        if (fieldDescriptor.required === true || fieldDescriptor.required === void 0) {
          throw new import_validation_error.ValidationError(path, type, data);
        } else {
          continue;
        }
      } else {
        throw new import_validation_error.ValidationError(path, type, data);
      }
    }
    const value = data[key];
    (0, import_validate_type.validateType)(`${path}.${key}`, getType(fieldDescriptor), value);
  }
};
