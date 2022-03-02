import type { AllDataTypes } from "..";
import type { ParseDataType, ReWrap } from "../type-utils";
import type { ValidationError } from "./validation-error/validation-error";
/**
 * Higher order function that generates a new function which will
 * check the provided `data` against the `dataType` type
 * structure, and if the check is successful then the first
 * callback `onValidationSuccess` is invoked with `data` as it's
 * argument, otherwise the second callback `onValidationError` is
 * invoked with the type validation error as it's argument
 * (unless the callback is not specified).
 */
export declare const createTypeGuardedFunction: <DT extends AllDataTypes, R, ER = void>(dataType: DT, onValidationSuccess: (data: ReWrap<ParseDataType<DT>>) => R, onValidationError?: ((error: ValidationError, passedData: unknown) => ER) | undefined) => (data: unknown) => R | ER;
/** Function alias for the `createTypeGuardedFunction`. */
export declare const createValidatedFunction: <DT extends AllDataTypes, R, ER = void>(dataType: DT, onValidationSuccess: (data: ReWrap<ParseDataType<DT>>) => R, onValidationError?: ((error: ValidationError, passedData: unknown) => ER) | undefined) => (data: unknown) => R | ER;
