"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStringInteger = void 0;
const validation_error_1 = require("../validation-error/validation-error");
const STRING_INTEGER_ALLOWED_CHARS = [
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
];
const validateStringInteger = (path, type, data) => {
    const throwError = () => {
        throw new validation_error_1.ValidationError(path, type, data);
    };
    if (typeof data !== "string")
        throwError();
    if (data
        .split("")
        .some((char) => !STRING_INTEGER_ALLOWED_CHARS.includes(char)))
        throwError();
    return;
};
exports.validateStringInteger = validateStringInteger;
