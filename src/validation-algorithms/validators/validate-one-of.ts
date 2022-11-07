import type { AnyDataType, OneOf } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateType } from "@Validation/validators/validate-type";

export const validateOneOf = (
  path: string[],
  type: OneOf<AnyDataType[]>,
  data: unknown
): void => {
  if (type.oneOf.length === 1) return validateType(path, type.oneOf[0], data);

  for (let i = 0; i < type.oneOf.length; i++) {
    try {
      validateType(path, type.oneOf[i], data);
      return;
    } catch (error) {
      continue;
    }
  }

  throw new ValidationError(path, type, data);
};
