import type { Literal } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { Path } from "../path";

export const validateLiteral = (path: Path, type: Literal, data: unknown) => {
  if (type.literal === data) return;

  throw new ValidationError(path, type, data);
};
