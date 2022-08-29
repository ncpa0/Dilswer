import type { AllDataTypes } from "../../data-types/types";
export declare class ValidationError extends TypeError {
    static isValidationError(e: unknown | ValidationError): e is ValidationError;
    private readonly _validation_error;
    fieldPath: string;
    expectedValueType: AllDataTypes;
    receivedValue: unknown;
    constructor(path: string, expected: AllDataTypes, value: unknown);
}
