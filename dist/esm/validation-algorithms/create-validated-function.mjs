// src/validation-algorithms/create-validated-function.ts
import { validateType } from "./validators/validate-type.mjs";
var createTypeGuardedFunction = (dataType, onValidationSuccess, onValidationError) => {
  const caller = (data) => {
    try {
      validateType("$", dataType, data);
      return onValidationSuccess(data);
    } catch (e) {
      return onValidationError ? onValidationError(e, data) : void 0;
    }
  };
  return caller;
};
var createValidatedFunction = createTypeGuardedFunction;
export {
  createTypeGuardedFunction,
  createValidatedFunction
};
