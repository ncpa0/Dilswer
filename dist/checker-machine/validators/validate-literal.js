"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLiteral = void 0;
var validation_error_1 = require("../validation-error/validation-error");
var validateLiteral = function (path, type, data) {
    if (type.literal === data)
        return;
    throw new validation_error_1.ValidationError(path, type, data);
};
exports.validateLiteral = validateLiteral;
