"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDataType = void 0;
const validate_type_1 = require("./validators/validate-type");
/**
 * Checks the provided `data` against the `dataType` type
 * definition and throws an ValidationError if the `data` does
 * not conform to the `dataType`
 */
const ensureDataType = (dataType, data) => (0, validate_type_1.validateType)("$", dataType, data);
exports.ensureDataType = ensureDataType;
