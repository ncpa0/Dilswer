"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Omit = void 0;
const type_def_helpers_1 = require("../type-def-helpers");
/**
 * Removes specified entries from the RecordOf Data Type. Similar
 * to the Typescript's `Omit<>` utility type.
 */
const Omit = (recordDataType, ...omitKeys) => {
    return {
        [type_def_helpers_1.dataTypeSymbol]: true,
        recordOf: Object.fromEntries(Object.entries(recordDataType.recordOf)
            .filter(([key]) => !omitKeys.includes(key))
            .map(([key, desc]) => [
            key,
            typeof desc === "object" && desc !== null ? Object.assign({}, desc) : desc,
        ])),
    };
};
exports.Omit = Omit;
