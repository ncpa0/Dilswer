"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.And = void 0;
const type_def_helpers_1 = require("../type-def-helpers");
/**
 * Merges two RecordOf Data Types into one. Similar to how the
 * Typescript `&` works.
 */
const And = (recordDataTypeA, recordDataTypeB) => {
    return {
        [type_def_helpers_1.dataTypeSymbol]: true,
        recordOf: Object.assign(Object.assign({}, Object.fromEntries(Object.entries(recordDataTypeA.recordOf).map(([key, desc]) => [
            key,
            typeof desc === "object" && desc !== null ? Object.assign({}, desc) : desc,
        ]))), Object.fromEntries(Object.entries(recordDataTypeB.recordOf).map(([key, desc]) => [
            key,
            typeof desc === "object" && desc !== null ? Object.assign({}, desc) : desc,
        ]))),
    };
};
exports.And = And;
