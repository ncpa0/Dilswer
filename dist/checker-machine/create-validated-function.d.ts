import { AllDataTypes } from "..";
import { ParseDataType, ReWrap } from "../type-utils";
import { ValidationError } from "./validation-error/validation-error";
export declare const createValidatedFunction: <DT extends AllDataTypes, R, ER = void>(validator: DT, onValidationSuccess: (data: ReWrap<ParseDataType<DT>>) => R, onValidationError?: ((error: ValidationError, passedData: unknown) => ER) | undefined) => (data: unknown) => R | ER | undefined;
