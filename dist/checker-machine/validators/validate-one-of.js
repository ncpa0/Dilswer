"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOneOf = void 0;
const validation_error_1 = require("../validation-error/validation-error");
const validate_type_1 = require("./validate-type");
const validateOneOf = (path, type, data) => {
    let passed = false;
    for (const dataType of type.oneOf) {
        try {
            (0, validate_type_1.validateType)(path, dataType, data);
            passed = true;
            break;
        }
        catch (e) {
            continue;
        }
    }
    if (passed)
        return;
    throw new validation_error_1.ValidationError(path, type, data);
};
exports.validateOneOf = validateOneOf;
