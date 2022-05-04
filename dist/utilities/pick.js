"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pick = void 0;
const type_def_helpers_1 = require("../type-def-helpers");
/**
 * Removes the not specified entries from the RecordOf Data Type.
 * Similar to the Typescript's `Pick<>` utility type.
 */
const Pick = (recordDataType, ...pickKeys) => {
    return {
        [type_def_helpers_1.dataTypeSymbol]: true,
        recordOf: Object.fromEntries(Object.entries(recordDataType.recordOf)
            .filter(([key]) => pickKeys.includes(key))
            .map(([key, desc]) => [
            key,
            typeof desc === "object" && desc !== null ? Object.assign({}, desc) : desc,
        ])),
    };
};
exports.Pick = Pick;
