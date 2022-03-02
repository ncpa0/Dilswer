"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validation_error_1 = require("../checker-machine/validation-error/validation-error");
const validate_type_1 = require("../checker-machine/validators/validate-type");
const validate = (validator) => {
    return function (_, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (data) {
            const onError = (...args) => {
                if (this.onValidationError &&
                    typeof this.onValidationError === "function") {
                    this.onValidationError(...args);
                }
            };
            try {
                (0, validate_type_1.validateType)("$", validator, data);
                return originalMethod.apply(this, data);
            }
            catch (e) {
                if (validation_error_1.ValidationError.isValidationError(e))
                    return onError(e, data, propertyKey);
                throw e;
            }
        };
        return descriptor;
    };
};
exports.validate = validate;
