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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AllDataTypes: () => import_types.AllDataTypes,
  ArrayOf: () => import_types.ArrayOf,
  BasicDataType: () => import_types.BasicDataType,
  ComplexDataType: () => import_types.ComplexDataType,
  DataType: () => import_data_types2.DataType,
  Enum: () => import_types.Enum,
  EnumMember: () => import_types.EnumMember,
  FieldDescriptor: () => import_types.FieldDescriptor,
  GetDataType: () => import_type_utils.GetDataType,
  Literal: () => import_types.Literal,
  OneOf: () => import_types.OneOf,
  RecordOf: () => import_types.RecordOf,
  SetOf: () => import_types.SetOf,
  TypeSchema: () => import_types.RecordTypeSchema,
  createChecker: () => import_create_validator2.createChecker,
  createTypeGuardedFunction: () => import_create_validated_function2.createTypeGuardedFunction,
  createValidatedFunction: () => import_create_validated_function2.createValidatedFunction,
  createValidator: () => import_create_validator2.createValidator,
  default: () => src_default,
  ensureDataType: () => import_ensure_data_type2.ensureDataType
});
module.exports = __toCommonJS(src_exports);
var import_data_types = require("./data-types/data-types.js");
var import_Intrinsic = require("./intrinsic-type-utils/index.js");
var import_create_validated_function = require("./validation-algorithms/create-validated-function.js");
var import_create_validator = require("./validation-algorithms/create-validator.js");
var import_ensure_data_type = require("./validation-algorithms/ensure-data-type.js");
var import_data_types2 = require("./data-types/data-types.js");
var import_type_utils = require("./data-types/type-utils.js");
var import_types = require("./data-types/types.js");
__reExport(src_exports, require("./intrinsic-type-utils/index.js"), module.exports);
var import_create_validated_function2 = require("./validation-algorithms/create-validated-function.js");
var import_create_validator2 = require("./validation-algorithms/create-validator.js");
var import_ensure_data_type2 = require("./validation-algorithms/ensure-data-type.js");
var src_default = {
  createChecker: import_create_validator.createChecker,
  createValidator: import_create_validator.createValidator,
  createTypeGuardedFunction: import_create_validated_function.createTypeGuardedFunction,
  createValidatedFunction: import_create_validated_function.createValidatedFunction,
  ensureDataType: import_ensure_data_type.ensureDataType,
  And: import_Intrinsic.And,
  Exclude: import_Intrinsic.Exclude,
  Omit: import_Intrinsic.Omit,
  Partial: import_Intrinsic.Partial,
  Pick: import_Intrinsic.Pick,
  Required: import_Intrinsic.Required,
  DataType: import_data_types.DataType
};
