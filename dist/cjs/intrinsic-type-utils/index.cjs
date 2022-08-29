"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/intrinsic-type-utils/index.ts
var intrinsic_type_utils_exports = {};
module.exports = __toCommonJS(intrinsic_type_utils_exports);
__reExport(intrinsic_type_utils_exports, require("./and.cjs"), module.exports);
__reExport(intrinsic_type_utils_exports, require("./exclude.cjs"), module.exports);
__reExport(intrinsic_type_utils_exports, require("./omit.cjs"), module.exports);
__reExport(intrinsic_type_utils_exports, require("./partial.cjs"), module.exports);
__reExport(intrinsic_type_utils_exports, require("./pick.cjs"), module.exports);
__reExport(intrinsic_type_utils_exports, require("./required.cjs"), module.exports);
