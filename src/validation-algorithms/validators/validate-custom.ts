import type { Custom } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";

export const validateCustom = (path: string, type: Custom, data: unknown) => {
  if (!type.custom(data)) throw new ValidationError(path, type, data);
};
