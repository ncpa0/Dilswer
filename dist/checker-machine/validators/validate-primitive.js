"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePrimitive = void 0;
var validation_error_1 = require("../validation-error/validation-error");
var validatePrimitive = function (path, type, data) {
    if (type === "unknown")
        return;
    if (type === "null" && data === null)
        return;
    var dataType = typeof data;
    if (dataType === type)
        return;
    throw new validation_error_1.ValidationError(path, type, data);
};
exports.validatePrimitive = validatePrimitive;
