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

// src/validation-algorithms/validators/validate-type.ts
var validate_type_exports = {};
__export(validate_type_exports, {
  validateType: () => validateType
});
module.exports = __toCommonJS(validate_type_exports);
var import_validate_array = require("./validate-array.cjs");
var import_validate_enum = require("./validate-enum.cjs");
var import_validate_enum_member = require("./validate-enum-member.cjs");
var import_validate_literal = require("./validate-literal.cjs");
var import_validate_one_of = require("./validate-one-of.cjs");
var import_validate_primitive = require("./validate-primitive.cjs");
var import_validate_record = require("./validate-record.cjs");
var import_validate_set = require("./validate-set.cjs");
var validateType = (path, type, data) => {
  if (typeof type === "string") {
    return (0, import_validate_primitive.validatePrimitive)(path, type, data);
  }
  if ("recordOf" in type) {
    return (0, import_validate_record.validateRecord)(path, type, data);
  }
  if ("arrayOf" in type) {
    return (0, import_validate_array.validateArray)(path, type, data);
  }
  if ("setOf" in type) {
    return (0, import_validate_set.validateSet)(path, type, data);
  }
  if ("oneOf" in type) {
    return (0, import_validate_one_of.validateOneOf)(path, type, data);
  }
  if ("literal" in type) {
    return (0, import_validate_literal.validateLiteral)(path, type, data);
  }
  if ("enumMember" in type) {
    return (0, import_validate_enum_member.validateEnumMember)(path, type, data);
  }
  if ("enumInstance" in type) {
    return (0, import_validate_enum.validateEnum)(path, type, data);
  }
};
