import type { AnyDataType, OneOf } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateType } from "@Validation/validators/validate-type";

export const validateOneOf = (
  path: string[],
  type: OneOf<AnyDataType[]>,
  data: unknown
) => {
  let passed = false;

  for (const dataType of type.oneOf) {
    try {
      validateType(path, dataType, data);
      passed = true;
      break;
    } catch (e) {
      if (type.oneOf.length === 1) throw e;
      continue;
    }
  }

  if (passed) return;

  throw new ValidationError(path, type, data);
};
