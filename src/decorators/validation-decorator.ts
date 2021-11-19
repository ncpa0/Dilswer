import type { AllDataTypes } from "..";
import { ValidationError } from "../checker-machine/validation-error/validation-error";
import { validateType } from "../checker-machine/validators/validate-type";

export type ValidationErrorHandlerArgs = [
  error: ValidationError,
  data: unknown,
  methodName: string
];

export type ClassWithValidation = {
  onValidationError(...args: ValidationErrorHandlerArgs): void;
};

export const validate = (validator: AllDataTypes) => {
  return function <K extends string>(
    _: any,
    propertyKey: K,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = function (
      this: Record<K, (data: unknown) => unknown> &
        Partial<ClassWithValidation>,
      data: unknown
    ) {
      const onError = (...args: ValidationErrorHandlerArgs) => {
        if (
          this.onValidationError &&
          typeof this.onValidationError === "function"
        ) {
          this.onValidationError(...args);
        }
      };

      try {
        validateType("$", validator, data);
        return originalMethod.apply(this, data);
      } catch (e) {
        if (ValidationError.isValidationError(e))
          return onError(e, data, propertyKey);

        throw e;
      }
    };

    return descriptor;
  };
};
