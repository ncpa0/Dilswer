"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateType = void 0;
var validate_array_1 = require("./validate-array");
var validate_one_of_1 = require("./validate-one-of");
var validate_primitive_1 = require("./validate-primitive");
var validate_record_1 = require("./validate-record");
var validate_set_1 = require("./validate-set");
var validateType = function (path, type, data) {
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
};
exports.validateType = validateType;
