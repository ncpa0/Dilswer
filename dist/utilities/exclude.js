"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exclude = void 0;
const type_def_helpers_1 = require("../type-def-helpers");
/**
 * Excludes given basic Data Types from the OneOf Data Type.
 * Similar to the Typescript's `Exclude<>` utility type.
 */
const Exclude = (union, ...excludeTypes) => {
    return {
        [type_def_helpers_1.dataTypeSymbol]: true,
        oneOf: union.oneOf.filter((t) => !excludeTypes.includes(t)),
    };
};
exports.Exclude = Exclude;
