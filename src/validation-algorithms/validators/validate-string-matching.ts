import type { StringMatching } from "@DataTypes/data-types";
import type { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";

export const validateStringMatching = (
  path: Path,
  type: StringMatching,
  data: unknown,
) => {
  if (typeof data !== "string" || !type.pattern.test(data)) {
    throw new ValidationError(path, type, data);
  }
};
