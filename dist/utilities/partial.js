"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Partial = void 0;
const is_field_descriptor_1 = require("../shared/is-field-descriptor");
const type_def_helpers_1 = require("../type-def-helpers");
/**
 * Makes all entries from the RecordOf Data Type not required.
 * Similar to the Typescript's `Partial<>` utility type.
 */
const Partial = (recordDataType) => {
    return {
        [type_def_helpers_1.dataTypeSymbol]: true,
        recordOf: Object.fromEntries(Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
            key,
            (0, is_field_descriptor_1.isFieldDescriptor)(descriptor)
                ? Object.assign(Object.assign({}, descriptor), { required: false }) : { type: descriptor, required: false },
        ])),
    };
};
exports.Partial = Partial;
