"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChecker = exports.createValidator = void 0;
var validate_type_1 = require("./validators/validate-type");
/**
 * Higher order function that generates a validator which will
 * check the provided `data` against the `dataType` type
 * structure definition and returns a boolean indicating if the
 * check was successful.
 */
var createValidator = function (dataType) {
    var validator = function (data) {
        try {
            (0, validate_type_1.validateType)("$", dataType, data);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    return validator;
};
exports.createValidator = createValidator;
/** Function alias for the `createValidator`. */
exports.createChecker = exports.createValidator;
