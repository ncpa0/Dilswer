"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
class ValidationError extends TypeError {
    constructor(path, expected, value) {
        super("Value does not conform the data type structure definition.");
        this._validation_error = true;
        this.expectedValueType = expected;
        this.fieldPath = path;
        this.receivedValue = value;
    }
    static isValidationError(e) {
        return (typeof e === "object" &&
            e !== null &&
            e instanceof Error &&
            "_validation_error" in e);
    }
}
exports.ValidationError = ValidationError;
