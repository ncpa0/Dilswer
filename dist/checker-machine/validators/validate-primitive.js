"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePrimitive = void 0;
const validation_error_1 = require("../validation-error/validation-error");
const validate_string_integer_1 = require("./validate-string-integer");
const validate_string_numeral_1 = require("./validate-string-numeral");
const validatePrimitive = (path, type, data) => {
    const throwError = () => {
        throw new validation_error_1.ValidationError(path, type, data);
    };
    if (type === "unknown")
        return;
    if (type === "null" && data === null)
        return;
    if (type === "stringnumeral") {
        return (0, validate_string_numeral_1.validateStringNumeral)(path, type, data);
    }
    if (type === "stringinteger") {
        return (0, validate_string_integer_1.validateStringInteger)(path, type, data);
    }
    if (type === "integer") {
        if (typeof data !== "number" || !Number.isInteger(data))
            throwError();
        else
            return;
    }
    if (type === "number") {
        if (typeof data !== "number" || Number.isNaN(data))
            throwError();
        else
            return;
    }
    if (typeof data === type)
        return;
    throwError();
};
exports.validatePrimitive = validatePrimitive;
