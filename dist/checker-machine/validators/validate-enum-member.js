"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnumMember = void 0;
var validation_error_1 = require("../validation-error/validation-error");
var validateEnumMember = function (path, type, data) {
    if (type.enumMember !== data) {
        throw new validation_error_1.ValidationError(path, type, data);
    }
};
exports.validateEnumMember = validateEnumMember;
