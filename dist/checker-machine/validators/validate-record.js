"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRecord = void 0;
const is_field_descriptor_1 = require("../../shared/is-field-descriptor");
const validation_error_1 = require("../validation-error/validation-error");
const validate_type_1 = require("./validate-type");
const getType = (v) => {
    if ((0, is_field_descriptor_1.isFieldDescriptor)(v))
        return v.type;
    return v;
};
const validateRecord = (path, type, data) => {
    if (typeof data !== "object" || data === null)
        throw new validation_error_1.ValidationError(path, type, data);
    for (const [key, fieldDescriptor] of Object.entries(type.recordOf)) {
        if (!(key in data)) {
            if ((0, is_field_descriptor_1.isFieldDescriptor)(fieldDescriptor)) {
                if (fieldDescriptor.required === true ||
                    fieldDescriptor.required === undefined) {
                    throw new validation_error_1.ValidationError(path, type, data);
                }
                else {
                    continue;
                }
            }
            else {
                throw new validation_error_1.ValidationError(path, type, data);
            }
        }
        // @ts-expect-error
        const value = data[key];
        (0, validate_type_1.validateType)(`${path}.${key}`, getType(fieldDescriptor), value);
    }
};
exports.validateRecord = validateRecord;
