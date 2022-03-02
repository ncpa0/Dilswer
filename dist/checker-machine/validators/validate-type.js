"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateType = void 0;
const validate_array_1 = require("./validate-array");
const validate_enum_1 = require("./validate-enum");
const validate_enum_member_1 = require("./validate-enum-member");
const validate_literal_1 = require("./validate-literal");
const validate_one_of_1 = require("./validate-one-of");
const validate_primitive_1 = require("./validate-primitive");
const validate_record_1 = require("./validate-record");
const validate_set_1 = require("./validate-set");
const validateType = (path, type, data) => {
    if (typeof type === "string") {
        return (0, validate_primitive_1.validatePrimitive)(path, type, data);
    }
    if ("recordOf" in type) {
        return (0, validate_record_1.validateRecord)(path, type, data);
    }
    if ("arrayOf" in type) {
        return (0, validate_array_1.validateArray)(path, type, data);
    }
    if ("setOf" in type) {
        return (0, validate_set_1.validateSet)(path, type, data);
    }
    if ("oneOf" in type) {
        return (0, validate_one_of_1.validateOneOf)(path, type, data);
    }
    if ("literal" in type) {
        return (0, validate_literal_1.validateLiteral)(path, type, data);
    }
    if ("enumMember" in type) {
        return (0, validate_enum_member_1.validateEnumMember)(path, type, data);
    }
    if ("enumInstance" in type) {
        return (0, validate_enum_1.validateEnum)(path, type, data);
    }
};
exports.validateType = validateType;
