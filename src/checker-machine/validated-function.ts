import { AllDataTypes, ParseDataType } from "..";
import { ValidationError } from "./validation-error/validation-error";
import { validateType } from "./validators/validate-type";

export const createValidatedFunction = <DT extends AllDataTypes, R, ER = void>(
  validator: DT,
  onValidationSuccess: (data: ParseDataType<DT>) => R,
  onValidationError?: (error: ValidationError, passedData: unknown) => ER
) => {
  const call = (data: unknown) => {
    try {
      validateType("$", validator, data);
      return onValidationSuccess(data as ParseDataType<DT>);
    } catch (e) {
      return onValidationError
        ? onValidationError(e as ValidationError, data)
        : void 0;
    }
  };

  return call;
};
