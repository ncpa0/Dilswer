"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnum = void 0;
const validation_error_1 = require("../validation-error/validation-error");
const validateEnum = (path, type, data) => {
    const isDataEqualToAnyMember = Object.entries(type.enumInstance).some(([key, member]) => isNaN(Number(key)) && member === data);
    if (!isDataEqualToAnyMember) {
        throw new validation_error_1.ValidationError(path, type, data);
    }
};
exports.validateEnum = validateEnum;
