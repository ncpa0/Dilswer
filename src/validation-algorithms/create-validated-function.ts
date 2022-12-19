import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AnyDataType } from "@DataTypes/types";
import { Path } from "@Validation/path";
import type { ValidationError } from "@Validation/validation-error/validation-error";
import { validatorsLookupMap } from "@Validation/validators/validate-type";

const DEFAULT_ROOT = Path.init("$");

/**
 * Higher order function that generates a new function which will
 * check the provided `data` against the `dataType` type
 * structure, and if the check is successful then the first
 * callback `onValidationSuccess` is invoked with `data` as it's
 * argument, otherwise the second callback `onValidationError` is
 * invoked with the type validation error as it's argument
 * (unless the callback is not specified).
 */
export const createTypeGuardedFunction = <DT extends AnyDataType, R, ER = void>(
  dataType: DT,
  onValidationSuccess: (data: ReWrap<ParseDataType<DT>>) => R,
  onValidationError?: (error: ValidationError, passedData: unknown) => ER
) => {
  const caller = (data: unknown): R | ER => {
    try {
      validatorsLookupMap.get(dataType.kind)!(DEFAULT_ROOT, dataType, data);
      // @ts-expect-error
      return onValidationSuccess(data);
    } catch (e) {
      // @ts-expect-error
      return onValidationError
        ? onValidationError(e as ValidationError, data)
        : void 0;
    }
  };

  return caller;
};

/** Function alias for the `createTypeGuardedFunction`. */
export const createValidatedFunction = createTypeGuardedFunction;
