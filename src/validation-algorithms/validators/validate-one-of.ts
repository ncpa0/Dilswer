import type { AllDataTypes, OneOf } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateType } from "@Validation/validators/validate-type";

export const validateOneOf = (
  path: string,
  type: OneOf<AllDataTypes[]>,
  data: unknown
) => {
  let passed = false;

  for (const dataType of type.oneOf) {
    try {
      validateType(path, dataType, data);
      passed = true;
      break;
    } catch (e) {
      continue;
    }
  }

  if (passed) return;

  throw new ValidationError(path, type, data);
};
