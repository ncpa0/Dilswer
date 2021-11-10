import { AllDataTypes } from "..";
import { ValidationError } from "../checker-machine/validation-error/validation-error";
export declare type ValidationErrorHandlerArgs = [
    error: ValidationError,
    data: unknown,
    methodName: string
];
export declare type ClassWithValidation = {
    onValidationError(...args: ValidationErrorHandlerArgs): void;
};
export declare const validate: (validator: AllDataTypes) => <K extends string>(_: any, propertyKey: K, descriptor: PropertyDescriptor) => PropertyDescriptor;
