import type { Custom } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";

export const validateCustom = (path: Path, type: Custom, data: unknown) => {
  if (!type.custom(data)) throw new ValidationError(path, type, data);
};
