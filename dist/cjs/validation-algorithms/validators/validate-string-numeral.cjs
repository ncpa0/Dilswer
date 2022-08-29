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

// src/validation-algorithms/validators/validate-string-numeral.ts
var validate_string_numeral_exports = {};
__export(validate_string_numeral_exports, {
  validateStringNumeral: () => validateStringNumeral
});
module.exports = __toCommonJS(validate_string_numeral_exports);
var import_validation_error = require("../validation-error/validation-error.cjs");
var STRING_NUMERAL_ALLOWED_CHARS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "."
];
var validateStringNumeral = (path, type, data) => {
  const throwError = () => {
    throw new import_validation_error.ValidationError(path, type, data);
  };
  if (typeof data !== "string")
    throwError();
  if (data.split("").some((char) => !STRING_NUMERAL_ALLOWED_CHARS.includes(char)))
    throwError();
  return;
};
