import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AnyType } from "@DataTypes/types";
import { validatedCircularValues } from "@DataTypes/types/recursive";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";

const DEFAULT_ROOT = Path.init("$");

type ValidationResults<T> = {
  success: false;
  error: ValidationError;
} | {
  success: true;
  value: T;
};

export function validator<DT extends AnyType>(
  dataType: DT,
): (data: unknown) => data is ReWrap<ParseDataType<DT>>;
export function validator<DT extends AnyType>(
  dataType: DT,
  options: { details: true },
): (data: unknown) => ValidationResults<ReWrap<ParseDataType<DT>>>;
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
        if (!ValidationError.isValidationError(e)) throw e;
        return {
          success: false,
          error: e,
        };
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
