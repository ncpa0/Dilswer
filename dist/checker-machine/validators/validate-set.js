"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSet = void 0;
const type_def_helpers_1 = require("../../type-def-helpers");
const validation_error_1 = require("../validation-error/validation-error");
const validate_one_of_1 = require("./validate-one-of");
const isSet = (data) => {
    return (typeof data === "object" &&
        data !== null &&
        // @ts-expect-error
        data[Symbol.toStringTag] === "Set");
};
const validateSet = (path, type, data) => {
    if (!isSet(data))
        throw new validation_error_1.ValidationError(path, type, data);
    for (const elem of data) {
        (0, validate_one_of_1.validateOneOf)(`${path}.SET`, type_def_helpers_1.DataType.OneOf(...type.setOf), elem);
    }
};
exports.validateSet = validateSet;
