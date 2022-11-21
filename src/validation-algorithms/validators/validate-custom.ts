import type { Custom } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { Path } from "../path";

export const validateCustom = (path: Path, type: Custom, data: unknown) => {
  if (!type.custom(data)) throw new ValidationError(path, type, data);
};
