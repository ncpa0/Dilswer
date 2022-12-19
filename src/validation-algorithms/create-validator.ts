import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AnyDataType } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validatorsLookupMap } from "@Validation/validators/validate-type";

const DEFAULT_ROOT = Path.init("$");

/**
 * Higher order function that generates a validator which will
 * check the provided `data` against the `dataType` type
 * structure definition and returns a boolean indicating if the
 * check was successful.
 */
export const createValidator = <DT extends AnyDataType>(
  dataType: DT
): ((data: unknown) => data is ReWrap<ParseDataType<DT>>) => {
  const validator = (data: unknown): data is ReWrap<ParseDataType<DT>> => {
    try {
      validatorsLookupMap.get(dataType.kind)!(DEFAULT_ROOT, dataType, data);
      return true;
    } catch (e) {
      if (!ValidationError.isValidationError(e)) throw e;
      return false;
    }
  };

  return validator;
};

/** Function alias for the `createValidator`. */
export const createChecker = createValidator;
