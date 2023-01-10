import type { Literal } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";

export const validateLiteral = (path: Path, type: Literal, data: unknown) => {
  if (type.literal === data) return;

  throw new ValidationError(path, type, data);
};
