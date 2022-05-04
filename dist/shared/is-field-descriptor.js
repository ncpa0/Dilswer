"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFieldDescriptor = void 0;
const type_def_helpers_1 = require("../type-def-helpers");
const isFieldDescriptor = (v) => {
    const isObject = typeof v === "object";
    if (isObject) {
        const hasSymbol = type_def_helpers_1.dataTypeSymbol in v;
        if (!hasSymbol)
            return true;
    }
    return false;
};
exports.isFieldDescriptor = isFieldDescriptor;
