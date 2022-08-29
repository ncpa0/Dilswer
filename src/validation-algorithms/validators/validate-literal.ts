import type { Literal } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";

export const validateLiteral = (path: string, type: Literal, data: unknown) => {
  if (type.literal === data) return;

  throw new ValidationError(path, type, data);
};
