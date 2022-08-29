import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AllDataTypes } from "@DataTypes/types";
import { validateType } from "@Validation/validators/validate-type";

/**
 * Higher order function that generates a validator which will
 * check the provided `data` against the `dataType` type
 * structure definition and returns a boolean indicating if the
 * check was successful.
 */
export const createValidator = <DT extends AllDataTypes>(dataType: DT) => {
  const validator = (data: unknown): data is ReWrap<ParseDataType<DT>> => {
    try {
      validateType("$", dataType, data);
      return true;
    } catch (e) {
      return false;
    }
  };

  return validator;
};

/** Function alias for the `createValidator`. */
export const createChecker = createValidator;
