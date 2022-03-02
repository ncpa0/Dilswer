"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidatedFunction = exports.createTypeGuardedFunction = void 0;
var validate_type_1 = require("./validators/validate-type");
/**
 * Higher order function that generates a new function which will
 * check the provided `data` against the `dataType` type
 * structure, and if the check is successful then the first
 * callback `onValidationSuccess` is invoked with `data` as it's
 * argument, otherwise the second callback `onValidationError` is
 * invoked with the type validation error as it's argument
 * (unless the callback is not specified).
 */
var createTypeGuardedFunction = function (dataType, onValidationSuccess, onValidationError) {
    var caller = function (data) {
        try {
            (0, validate_type_1.validateType)("$", dataType, data);
            // @ts-expect-error
            return onValidationSuccess(data);
        }
        catch (e) {
            // @ts-expect-error
            return onValidationError
                ? onValidationError(e, data)
                : void 0;
        }
    };
    return caller;
};
exports.createTypeGuardedFunction = createTypeGuardedFunction;
/** Function alias for the `createTypeGuardedFunction`. */
exports.createValidatedFunction = exports.createTypeGuardedFunction;
