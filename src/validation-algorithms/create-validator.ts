import type { AnyType } from "@DataTypes/type-types";
import type { InferDType, ReWrap } from "@DataTypes/type-utils";
import { validatedCircularValues } from "@DataTypes/types/recursive";
import { Path } from "@Validation/path";
import {
  AggregateValidationError,
  ValidationError,
} from "@Validation/validation-error/validation-error";

const DEFAULT_ROOT = Path.init("$");

type ValidationResults<T> = {
  success: false;
  error: ValidationError | AggregateValidationError;
} | {
  success: true;
  value: T;
};

type Validator<T> = (data: unknown) => data is T;
type ValidatorWithDetails<T> = (data: unknown) => ValidationResults<T>;

export function validator<DT extends AnyType>(
  dataType: DT,
): Validator<ReWrap<InferDType<DT>>>;
export function validator<DT extends AnyType>(
  dataType: DT,
  options: { details: true },
): ValidatorWithDetails<ReWrap<InferDType<DT>>>;
export function validator(
  dataType: AnyType,
  options?: { details: true },
) {
  if (options?.details) {
    return (data: unknown): ValidationResults<any> => {
      try {
        dataType["~validate"](DEFAULT_ROOT, data);
        return {
          success: true,
          value: data,
        };
      } catch (e) {
        if (
          ValidationError.isValidationError(e)
          || AggregateValidationError.isAggregateValidationError(e)
        ) {
          return {
            success: false,
            error: e,
          };
        }
        throw e;
      } finally {
        validatedCircularValues.clear();
      }
    };
  } else {
    return (value: unknown) => {
      try {
        return dataType["~matches"](value);
      } finally {
        validatedCircularValues.clear();
      }
    };
  }
}

export function validateWith<DT extends AnyType>(
  dataType: DT,
  value: any,
) {
  return validator(dataType, { details: true })(value);
}
