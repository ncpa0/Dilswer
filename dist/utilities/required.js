"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Required = void 0;
const is_field_descriptor_1 = require("../shared/is-field-descriptor");
const type_def_helpers_1 = require("../type-def-helpers");
/**
 * Makes all entries from the RecordOf Data Type required.
 * Similar to the Typescript's `Required<>` utility type.
 */
const Required = (recordDataType) => {
    return {
        [type_def_helpers_1.dataTypeSymbol]: true,
        recordOf: Object.fromEntries(Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
            key,
            (0, is_field_descriptor_1.isFieldDescriptor)(descriptor)
                ? Object.assign(Object.assign({}, descriptor), { required: true }) : { type: descriptor, required: true },
        ])),
    };
};
exports.Required = Required;
