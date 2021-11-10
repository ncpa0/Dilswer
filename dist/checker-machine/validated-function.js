"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidatedFunction = void 0;
var validate_type_1 = require("./validators/validate-type");
var createValidatedFunction = function (validator, onValidationSuccess, onValidationError) {
    var call = function (data) {
        try {
            (0, validate_type_1.validateType)("$", validator, data);
            return onValidationSuccess(data);
        }
        catch (e) {
            return onValidationError
                ? onValidationError(e, data)
                : void 0;
        }
    };
    return call;
};
exports.createValidatedFunction = createValidatedFunction;
